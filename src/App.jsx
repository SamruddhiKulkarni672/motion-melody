// import React, { useState, useCallback, useEffect } from 'react';
// import Conductor from './components/Conductor';
// import OrchestraPit from './components/OrchestraPit';
// import Controls from './components/Controls';
// import { MusicPlayer } from './utils/musicUtils';

// function App() {
//   const [tempo, setTempo] = useState(120);
//   const [volume, setVolume] = useState(0.5);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [musicPlayer] = useState(new MusicPlayer());

//   const handleGestureChange = useCallback(({ gesture, handPosition }) => {
//     // Control volume with vertical hand position
//     const newVolume = 1 - handPosition.y;
//     setVolume(Math.max(0.1, Math.min(1, newVolume)));

//     // Control tempo with horizontal hand position
//     const newTempo = 40 + (handPosition.x * 140);
//     setTempo(Math.max(40, Math.min(180, newTempo)));

//     // Start/stop based on gesture
//     if (gesture.includes('Open Hand') && !isPlaying) {
//       handleStartMusic();
//     } else if (gesture.includes('Closed Hand') && isPlaying) {
//       handlePauseMusic();
//     }
//   }, [isPlaying]);

//   const handleStartMusic = () => {
//     musicPlayer.start();
//     musicPlayer.setTempo(tempo);
//     musicPlayer.setVolume(volume);
//     setIsPlaying(true);
//   };

//   const handlePauseMusic = () => {
//     musicPlayer.stop();
//     setIsPlaying(false);
//   };

//   const handleTempoChange = (newTempo) => {
//     setTempo(newTempo);
//     musicPlayer.setTempo(newTempo);
//   };

//   useEffect(() => {
//     if (musicPlayer && isPlaying) {
//       musicPlayer.setTempo(tempo);
//       musicPlayer.setVolume(volume);
//     }
//   }, [tempo, volume, isPlaying, musicPlayer]);

//   return (
//     <div className="container">
//       <header>
//         <h1>Virtual Symphony Conductor</h1>
//         <p className="subtitle">Conduct your own Studio Ghibli-style orchestra with hand gestures</p>
//       </header>
      
//       <div className="main-content">
//         <Conductor onGestureChange={handleGestureChange} />
//         <OrchestraPit tempo={tempo} volume={volume} isPlaying={isPlaying} />
//       </div>

//       <Controls
//         onStartMusic={handleStartMusic}
//         onPauseMusic={handlePauseMusic}
//         onTempoChange={handleTempoChange}
//         tempo={tempo}
//         isPlaying={isPlaying}
//       />

//       <div className="instructions">
//         <h3>How to Conduct:</h3>
//         <ul>
//           <li>Open your hand to start/stop the music</li>
//           <li>Move your hand up/down to control volume</li>
//           <li>Move your hand left/right to control tempo</li>
//           <li>Make a fist to pause the music</li>
//           <li>Watch the orchestra pit respond to your conducting!</li>
//         </ul>
//       </div>

//       <footer>
//         <p>Virtual Symphony Conductor &copy; 2023 | Use hand gestures to control your Studio Ghibli-style orchestra</p>
//       </footer>
//     </div>
//   );
// }

// export default App;




import React, { useState, useCallback, useEffect } from 'react';
import Conductor from './components/Conductor';
import OrchestraPit from './components/OrchestraPit';
import Controls from './components/Controls';
import { MusicPlayer } from './utils/musicUtils';

function App() {
  const [tempo, setTempo] = useState(120);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicPlayer] = useState(new MusicPlayer());
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 }); // Add handPosition state

  const handleGestureChange = useCallback(({ gesture, handPosition }) => {
    // Update hand position state
    setHandPosition(handPosition);

    // Control volume with vertical hand position
    const newVolume = 1 - handPosition.y;
    setVolume(Math.max(0.1, Math.min(1, newVolume)));

    // Control tempo with horizontal hand position
    const newTempo = 40 + (handPosition.x * 140);
    setTempo(Math.max(40, Math.min(180, newTempo)));

    // Start/stop based on gesture
    if (gesture.includes('Open Hand') && !isPlaying) {
      handleStartMusic();
    } else if (gesture.includes('Closed Hand') && isPlaying) {
      handlePauseMusic();
    }
  }, [isPlaying]);

  const handleStartMusic = () => {
    musicPlayer.start();
    musicPlayer.setTempo(tempo);
    musicPlayer.setVolume(volume);
    setIsPlaying(true);
  };

  const handlePauseMusic = () => {
    musicPlayer.stop();
    setIsPlaying(false);
  };

  const handleTempoChange = (newTempo) => {
    setTempo(newTempo);
    if (musicPlayer && isPlaying) {
      musicPlayer.setTempo(newTempo);
    }
  };

  useEffect(() => {
    if (musicPlayer && isPlaying) {
      musicPlayer.setTempo(tempo);
      musicPlayer.setVolume(volume);
    }
  }, [tempo, volume, isPlaying, musicPlayer]);

  return (
    <div className="container">
      <header>
        <h1>Motion Melody</h1>
        <p className="subtitle">Conduct your own Studio  orchestra with hand gestures</p>
      </header>
      
      <div className="main-content">
        <Conductor onGestureChange={handleGestureChange} />
        {/* Pass handPosition to OrchestraPit */}
        <OrchestraPit 
          tempo={tempo} 
          volume={volume} 
          isPlaying={isPlaying} 
          handPosition={handPosition} 
        />
      </div>

      <Controls
        onStartMusic={handleStartMusic}
        onPauseMusic={handlePauseMusic}
        onTempoChange={handleTempoChange}
        tempo={tempo}
        isPlaying={isPlaying}
      />

      <div className="instructions">
        <h3>How to Conduct:</h3>
        <ul>
          <li>Open your hand to start/stop the music</li>
          <li>Move your hand up/down to control volume</li>
          <li>Move your hand left/right to control tempo</li>
          <li>Make a fist to pause the music</li>
          <li>Watch the orchestra pit respond to your conducting!</li>
        </ul>
      </div>
 
      

      <footer>
        <p>Virtual Symphony Conductor &copy; 2023 | Use hand gestures to control your Studio orchestra</p>
      </footer>
    </div>
  );
}

export default App;