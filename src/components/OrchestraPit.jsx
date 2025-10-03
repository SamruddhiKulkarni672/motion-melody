// import React, { useState, useEffect } from 'react';
// import { createMusicParticles } from '../utils/musicUtils';

// const OrchestraPit = ({ tempo, volume, isPlaying }) => {
//   const [particles, setParticles] = useState([]);
//   const [notes, setNotes] = useState([]);

//   useEffect(() => {
//     // Create musical notes
//     const newNotes = Array.from({ length: 5 }, (_, i) => ({
//       id: i,
//       char: i % 2 === 0 ? '♪' : '♫',
//       style: { animationDelay: `${i * 0.5}s` }
//     }));
//     setNotes(newNotes);

//     // Update particles based on tempo
//     setParticles(createMusicParticles(20, tempo));
//   }, [tempo]);

//   useEffect(() => {
//     // Add/remove particles when music starts/stops
//     if (isPlaying) {
//       setParticles(createMusicParticles(30, tempo));
//     } else {
//       setParticles(createMusicParticles(10, tempo));
//     }
//   }, [isPlaying, tempo]);

//   return (
//     <div className="orchestra-section">
//       <h2 className="section-title">Orchestra Pit</h2>
//       <div className="orchestra-visualization">
//         {/* Musical Notes */}
//         {notes.map(note => (
//           <div key={note.id} className={`musical-note note-${note.id + 1}`} style={note.style}>
//             {note.char}
//           </div>
//         ))}

//         {/* Music Strings */}
//         {[1, 2, 3, 4].map(i => (
//           <div key={i} className={`music-string string-${i}`}></div>
//         ))}

//         {/* Instruments */}
//         {/* <div className="instrument violin" style={{ top: '20%', left: '10%' }}></div>
//         <div className="instrument piano" style={{ top: '70%', left: '20%' }}></div>
//         <div className="instrument harp" style={{ top: '30%', left: '80%' }}></div>
//         <div className="instrument flute" style={{ top: '75%', left: '70%' }}></div> */}

//         {/* Music Particles */}
//         {particles.map(particle => (
//           <div
//             key={particle.id}
//             className="music-particle"
//             style={{
//               left: `${particle.left}%`,
//               animationDelay: `${particle.delay}s`,
//               animationDuration: `${particle.duration}s`
//             }}
//           ></div>
//         ))}

//         {/* Volume/Tempo Indicators */}
//         <div className="volume-indicator" style={{
//           position: 'absolute',
//           bottom: '10px',
//           left: '10px',
//           background: `rgba(255, 215, 0, ${volume})`,
//           padding: '5px 10px',
//           borderRadius: '5px',
//           fontSize: '0.8rem'
//         }}>
//           Volume: {Math.round(volume * 100)}%
//         </div>

//         <div className="tempo-indicator" style={{
//           position: 'absolute',
//           bottom: '10px',
//           right: '10px',
//           background: `rgba(255, 100, 100, ${tempo / 180})`,
//           padding: '5px 10px',
//           borderRadius: '5px',
//           fontSize: '0.8rem'
//         }}>
//           Tempo: {Math.round(tempo)} BPM
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrchestraPit;



import React, { useState, useEffect } from 'react';
import { createMusicParticles } from '../utils/musicUtils';

const OrchestraPit = ({ tempo, volume, isPlaying, handPosition }) => {
  const [particles, setParticles] = useState([]);
  const [notes, setNotes] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Create musical notes
    const newNotes = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      char: i % 2 === 0 ? '♪' : '♫',
      style: { animationDelay: `${i * 0.5}s` }
    }));
    setNotes(newNotes);

    // Update particles based on tempo
    setParticles(createMusicParticles(20, tempo));
  }, [tempo]);

  useEffect(() => {
    // Add/remove particles when music starts/stops
    if (isPlaying) {
      setParticles(createMusicParticles(30, tempo));
    } else {
      setParticles(createMusicParticles(10, tempo));
    }
  }, [isPlaying, tempo]);

  // Effect to create sparkles based on hand position
  useEffect(() => {
    if (handPosition.x > 0 && handPosition.y > 0) {
      // Convert hand position (0-1) to percentage for the OrchestraPit
      const xPercent = handPosition.x * 100;
      const yPercent = handPosition.y * 100;

      // Create new sparkle at hand position
      const newSparkle = {
        id: Date.now() + Math.random(),
        x: xPercent,
        y: yPercent,
        size: Math.random() * 10 + 5,
        opacity: 1,
        life: 100
      };

      setSparkles(prev => [...prev.slice(-20), newSparkle]); // Keep only last 20 sparkles
    }
  }, [handPosition]);

  // Update sparkles animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkles(prev => 
        prev.map(sparkle => ({
          ...sparkle,
          opacity: sparkle.opacity * 0.95,
          life: sparkle.life - 5,
          size: sparkle.size * 0.98
        })).filter(sparkle => sparkle.life > 0)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="orchestra-section">
      <h2 className="section-title">Orchestra Pit</h2>
      <div className="orchestra-visualization">
        {/* Hand Position Sparkles */}
        {sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            className="hand-sparkle"
            style={{
              position: 'absolute',
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              opacity: sparkle.opacity,
              background: 'radial-gradient(circle, #ffd700, #ff6b6b, #4ecdc4)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              filter: 'blur(1px)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
        ))}

        {/* Hand Position Indicator */}
        {handPosition.x > 0 && handPosition.y > 0 && (
          <div
            className="hand-indicator"
            style={{
              position: 'absolute',
              left: `${handPosition.x * 100}%`,
              top: `${handPosition.y * 100}%`,
              width: '20px',
              height: '20px',
              background: 'rgba(255, 215, 0, 0.8)',
              border: '2px solid #ff6b6b',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 15,
              boxShadow: '0 0 20px #ffd700'
            }}
          />
        )}

        {/* Musical Notes */}
        {notes.map(note => (
          <div key={note.id} className={`musical-note note-${note.id + 1}`} style={note.style}>
            {note.char}
          </div>
        ))}

        {/* Music Strings */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`music-string string-${i}`}></div>
        ))}

        {/* Music Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="music-particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          ></div>
        ))}

        {/* Volume/Tempo Indicators */}
        <div className="volume-indicator" style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: `rgba(255, 215, 0, ${volume})`,
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '0.8rem'
        }}>
          Volume: {Math.round(volume * 100)}%
        </div>

        <div className="tempo-indicator" style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: `rgba(255, 100, 100, ${tempo / 180})`,
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '0.8rem'
        }}>
          Tempo: {Math.round(tempo)} BPM
        </div>

        {/* Hand Position Display */}
        <div className="hand-position-display" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '0.8rem',
          zIndex: 20
        }}>
          Hand: X: {(handPosition.x * 100).toFixed(0)}% Y: {(handPosition.y * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

export default OrchestraPit;