import React, { useRef, useEffect, useState } from "react";

/**
 * Air-Conductor — single-file React component
 * - Uses MediaPipe Hands (via CDN) to track hands from the webcam
 * - Uses Tone.js (via CDN) for audio synthesis and transport control
 * - Right hand vertical movement -> tempo (BPM)
 * - Right hand forward/back (z) or downstroke gesture -> beat/gesture (conducting beat)
 * - Left hand vertical movement -> dynamics (volume)
 * - Open palm toggles Play/Pause
 *
 * Notes for integration:
 * - This file is intended as a single React component you can drop into a Create React App / Vite React project.
 * - Add the following scripts to your index.html or include via npm packages:
 *   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/tone/build/Tone.min.js"></script>
 *
 * - You should provide your own orchestral stems or use the built-in synth loops provided here (lightweight).
 * - IMPORTANT: I cannot provide copyrighted Studio Ghibli tracks. Use royalty-free or original "Ghibli-like" compositions.
 */

export default function AirConductor() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [volume, setVolume] = useState(0); // dB
  const [statusMsg, setStatusMsg] = useState("Load camera to begin");
  const [useSynthFallback] = useState(true); // lightweight fallback when stems are not loaded

  // Tone components
  const playersRef = useRef({});
  const gainRef = useRef(null);

  // for smoothing
  const rightYRef = useRef(null);
  const leftYRef = useRef(null);
  const lastDownstrokeTime = useRef(0);

  useEffect(() => {
    // Initialize Tone
    (async () => {
      await Tone.start();
      // Master gain
      gainRef.current = new Tone.Volume(volume).toDestination();

      // simple synth loops fallback
      if (useSynthFallback) {
        const synths = {
          strings: new Tone.PolySynth(Tone.Synth).toDestination(),
          piano: new Tone.Synth().toDestination(),
          woodwind: new Tone.FMSynth().toDestination(),
        };

        // Simple repeating patterns using Tone.Loop
        playersRef.current = {
          loops: [],
        };

        // Strings pad loop
        const stringsLoop = new Tone.Loop(time => {
          synths.strings.triggerAttackRelease(["C4", "G4", "E4"], "2n", time);
        }, "2n");

        // Piano arpeggio
        const pianoLoop = new Tone.Loop(time => {
          synths.piano.triggerAttackRelease(["E4", "G4", "B4", "C5"], "8n", time);
        }, "4n");

        // Woodwind motif
        const windLoop = new Tone.Loop(time => {
          synths.woodwind.triggerAttackRelease("A4", "16n", time);
        }, "2n");

        playersRef.current.loops.push(stringsLoop, pianoLoop, windLoop);

        playersRef.current.startAll = () => {
          playersRef.current.loops.forEach(l => l.start(0));
        };
        playersRef.current.stopAll = () => {
          playersRef.current.loops.forEach(l => l.stop(0));
        };
      }

      setStatusMsg("Ready — allow camera and raise hands to conduct");
    })();

    // cleanup
    return () => {
      if (playersRef.current && playersRef.current.loops) {
        playersRef.current.loops.forEach(l => l.dispose && l.dispose());
      }
      gainRef.current && gainRef.current.dispose && gainRef.current.dispose();
    };
  }, []);

  // sync BPM & volume to Tone.Transport
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.volume.value = volume;
  }, [volume]);

  // Camera + MediaPipe Hands setup
  useEffect(() => {
    let hands = null;
    let camera = null;
    let runningLocal = false;

    const onResults = results => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandedness) {
        // iterate hands
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const landmarks = results.multiHandLandmarks[i];
          const label = results.multiHandedness[i].label; // "Left" or "Right"

          // draw landmarks
          for (const lm of landmarks) {
            const x = lm.x * canvas.width;
            const y = lm.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = label === "Right" ? "rgba(0,150,255,0.9)" : "rgba(255,120,80,0.9)";
            ctx.fill();
          }

          // use wrist (landmark 0) and index finger tip (8) to infer gestures
          const wrist = landmarks[0];
          const indexTip = landmarks[8];

          if (label === "Right") {
            // vertical controls tempo
            const rightY = indexTip.y; // normalized 0..1 from top
            // smoothing
            if (rightYRef.current == null) rightYRef.current = rightY;
            rightYRef.current = rightYRef.current * 0.85 + rightY * 0.15;

            // map rightY to BPM: top (0) -> 140, bottom (1) -> 60
            const mappedBpm = Math.round(60 + (1 - rightYRef.current) * 80);
            setBpm(prev => (Math.abs(prev - mappedBpm) > 1 ? mappedBpm : prev));

            // detect downstroke: large downward velocity on Y of wrist or index
            if (!indexTip._prevY) indexTip._prevY = indexTip.y;
            const vel = indexTip._prevY - indexTip.y; // positive when moving up, negative when moving down
            indexTip._prevY = indexTip.y;

            const now = performance.now();
            // detect a sharp downward motion (downstroke)
            if (vel < -0.03 && now - lastDownstrokeTime.current > 200) {
              lastDownstrokeTime.current = now;
              // trigger a conductor beat accent — small reverb hit or tempo tap
              // For demo, we bounce volume slightly or trigger a short chord
              triggerAccent();
            }
          }

          if (label === "Left") {
            const leftY = indexTip.y;
            if (leftYRef.current == null) leftYRef.current = leftY;
            leftYRef.current = leftYRef.current * 0.85 + leftY * 0.15;
            // map leftY to volume -30 dB (low) .. 0 dB (high)
            const mappedVol = Math.round(-30 + (1 - leftYRef.current) * 30);
            setVolume(mappedVol);
          }

          // detect palm open vs fist: simple heuristic using distance between landmarks
          const thumbTip = landmarks[4];
          const distThumbIndex = Math.hypot((thumbTip.x - indexTip.x), (thumbTip.y - indexTip.y));
          if (distThumbIndex > 0.12) {
            // open-ish, ensure running
            if (!runningLocal) {
              startMusic();
              runningLocal = true;
              setRunning(true);
            }
          } else {
            // closed-ish: pause
            if (runningLocal) {
              stopMusic();
              runningLocal = false;
              setRunning(false);
            }
          }
        }
      }

      ctx.restore();
    };

    const setup = async () => {
      if (!videoRef.current) return;
      setStatusMsg("Initializing hands model...");

      // create hands using MediaPipe (loaded globally from CDN)
      hands = new window.Hands({
        locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);

      camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });

      camera.start();
      setStatusMsg("Camera running — raise both hands to conduct");
    };

    setup();

    return () => {
      camera && camera.stop && camera.stop();
      hands && hands.close && hands.close();
    };
  }, []);

  function triggerAccent() {
    // brief accent using a burst synth
    const burst = new Tone.MembraneSynth().toDestination();
    burst.triggerAttackRelease("C3", "8n");
    burst.dispose && burst.dispose();
  }

  function startMusic() {
    // Start Tone.Transport and loops
    Tone.Transport.start();
    if (playersRef.current && playersRef.current.startAll) playersRef.current.startAll();
    setStatusMsg("Playing — conduct away!");
  }

  function stopMusic() {
    Tone.Transport.pause();
    if (playersRef.current && playersRef.current.stopAll) playersRef.current.stopAll();
    setStatusMsg("Paused — raise open palms to resume");
  }

  // basic UI controls (manual override)
  const handlePlayToggle = () => {
    if (Tone.Transport.state !== "started") {
      startMusic();
      setRunning(true);
    } else {
      stopMusic();
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-black/60 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Air-Conductor</h1>
        <p className="text-sm text-gray-300 mb-4">Conduct an orchestra with your hands using your webcam. Right hand controls tempo, left hand controls dynamics, open palms to play/pause.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg overflow-hidden bg-black/40 p-2">
            <video ref={videoRef} className="w-full" autoPlay playsInline muted style={{ display: 'none' }}></video>
            <canvas ref={canvasRef} width={640} height={480} className="w-full bg-black/20 rounded" />
          </div>

          <div className="space-y-4 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Transport</div>
                <div className="text-lg font-medium">{running ? 'Playing' : 'Paused'}</div>
              </div>
              <div>
                <button onClick={handlePlayToggle} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded">{running ? 'Pause' : 'Play'}</button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Tempo (BPM)</label>
              <div className="text-2xl font-semibold">{bpm}</div>
              <input type="range" min={40} max={160} value={bpm} onChange={e => setBpm(Number(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="text-xs text-gray-400">Dynamics (Volume dB)</label>
              <div className="text-2xl font-semibold">{volume} dB</div>
              <input type="range" min={-40} max={0} value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full" />
            </div>

            <div className="text-xs text-gray-400">Status</div>
            <div className="p-2 bg-black/30 rounded">{statusMsg}</div>

            <div className="text-sm text-gray-300 pt-2">
              <strong>Tips:</strong>
              <ul className="list-disc list-inside text-gray-400 mt-2">
                <li>Good lighting and a plain background improve tracking accuracy.</li>
                <li>Raise your right hand higher for faster tempo, lower for slower.</li>
                <li>Raise left hand higher for louder dynamics, lower for softer.</li>
                <li>Make a clear downward conducting motion to accent the beat.</li>
                <li>This demo uses lightweight synths. Upload your own orchestral stems in a production build for realistic sound.</li>
              </ul>
            </div>

          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400">Legal note: I can't provide or host Studio Ghibli's copyrighted music. If you want a Ghibli-style orchestral feel, compose original music or find royalty-free "Ghibli-like" tracks / hire a composer. This app maps your gestures to tempo, dynamics, accents — the audio source is up to you.</div>
      </div>
    </div>
  );
}
