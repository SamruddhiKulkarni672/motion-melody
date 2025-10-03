// import { useState, useEffect, useRef } from 'react';
// import { Camera } from '@mediapipe/camera_utils';
// import { Hands } from '@mediapipe/hands';
// import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// const HAND_CONNECTIONS = [
//   [0, 1], [1, 2], [2, 3], [3, 4],
//   [0, 5], [5, 6], [6, 7], [7, 8],
//   [5, 9], [9, 10], [10, 11], [11, 12],
//   [9, 13], [13, 14], [14, 15], [15, 16],
//   [13, 17], [17, 18], [18, 19], [19, 20],
//   [0, 17]
// ];

// export const useHandDetection = () => {
//   const [gesture, setGesture] = useState('No gesture detected');
//   const [handPosition, setHandPosition] = useState({ x: 0, y: 0 });
//   const [isDetecting, setIsDetecting] = useState(false);
//   const cameraRef = useRef(null);
//   const canvasRef = useRef(null);
//   const handsRef = useRef(null);

//   const onHandResults = (results) => {
//     const canvasCtx = canvasRef.current?.getContext('2d');
//     const video = cameraRef.current;

//     if (!canvasCtx || !video) return;

//     canvasCtx.save();
//     canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

//     if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
//       for (const landmarks of results.multiHandLandmarks) {
//         drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
//           color: '#00FF00',
//           lineWidth: 2
//         });
//         drawLandmarks(canvasCtx, landmarks, {
//           color: '#FF0000',
//           lineWidth: 1
//         });

//         analyzeGesture(landmarks);
//       }
//     }
//     canvasCtx.restore();
//   };

//   const analyzeGesture = (landmarks) => {
//     const wrist = landmarks[0];
//     const indexTip = landmarks[8];
    
//     const indexDistance = Math.sqrt(
//       Math.pow(indexTip.x - wrist.x, 2) + 
//       Math.pow(indexTip.y - wrist.y, 2)
//     );

//     const isHandOpen = indexDistance > 0.3;
//     const isHandClosed = indexDistance < 0.15;

//     setHandPosition({ x: wrist.x, y: wrist.y });

//     if (isHandOpen) {
//       setGesture('Open Hand - Music Playing');
//     } else if (isHandClosed) {
//       setGesture('Closed Hand - Music Paused');
//     } else {
//       setGesture('Other Gesture');
//     }
//   };

//   const startDetection = async () => {
//     if (!cameraRef.current || !canvasRef.current) return;

//     const video = cameraRef.current;
//     const canvas = canvasRef.current;

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480 }
//       });

//       video.srcObject = stream;
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       const hands = new Hands({
//         locateFile: (file) => {
//           return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
//         }
//       });

//       hands.setOptions({
//         maxNumHands: 1,
//         modelComplexity: 1,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5
//       });

//       hands.onResults(onHandResults);
//       handsRef.current = hands;

//       const camera = new Camera(video, {
//         onFrame: async () => {
//           await hands.send({ image: video });
//         },
//         width: 640,
//         height: 480
//       });

//       camera.start();
//       setIsDetecting(true);
//     } catch (error) {
//       console.error('Error accessing camera:', error);
//       alert('Could not access your camera. Please make sure you have a camera connected and have granted permission.');
//     }
//   };

//   useEffect(() => {
//     return () => {
//       if (cameraRef.current?.srcObject) {
//         cameraRef.current.srcObject.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   return {
//     gesture,
//     handPosition,
//     isDetecting,
//     cameraRef,
//     canvasRef,
//     startDetection
//   };
// };




import { useState, useEffect, useRef } from "react";

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export const useHandDetection = () => {
  const [gesture, setGesture] = useState("No gesture detected");
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 });
  const [isDetecting, setIsDetecting] = useState(false);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);

  const onHandResults = (results) => {
    const canvasCtx = canvasRef.current?.getContext("2d");
    const video = cameraRef.current;

    if (!canvasCtx || !video || !window.drawConnectors || !window.drawLandmarks) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (results.image) {
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        window.drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });
        window.drawLandmarks(canvasCtx, landmarks, {
          color: "#FF0000",
          lineWidth: 1,
        });

        analyzeGesture(landmarks);
      }
    }
    canvasCtx.restore();
  };

  const analyzeGesture = (landmarks) => {
    const wrist = landmarks[0];
    const indexTip = landmarks[8];

    const indexDistance = Math.sqrt(
      Math.pow(indexTip.x - wrist.x, 2) + Math.pow(indexTip.y - wrist.y, 2)
    );

    const isHandOpen = indexDistance > 0.3;
    const isHandClosed = indexDistance < 0.15;

    setHandPosition({ x: wrist.x, y: wrist.y });

    if (isHandOpen) {
      setGesture("Open Hand - Music Playing");
    } else if (isHandClosed) {
      setGesture("Closed Hand - Music Paused");
    } else {
      setGesture("Other Gesture");
    }
  };

  const startDetection = async () => {
    if (!cameraRef.current || !canvasRef.current) return;

    try {
      // Load MediaPipe scripts sequentially
      await import("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
      await import("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
      await import("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");

      const video = cameraRef.current;
      const canvas = canvasRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      video.srcObject = stream;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Use window.Hands (global object)
      const hands = new window.Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onHandResults);
      handsRef.current = hands;

      // Use window.Camera (global object)
      const camera = new window.Camera(video, {
        onFrame: async () => {
          await hands.send({ image: video });
        },
        width: 640,
        height: 480,
      });

      camera.start();
      setIsDetecting(true);
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Could not access your camera. Please make sure you have a camera connected and have granted permission."
      );
    }
  };

  useEffect(() => {
    return () => {
      if (cameraRef.current?.srcObject) {
        cameraRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    gesture,
    handPosition,
    isDetecting,
    cameraRef,
    canvasRef,
    startDetection,
  };
};