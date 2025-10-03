import React from 'react';
import { useHandDetection } from '../hooks/useHandDetection';

const Conductor = ({ onGestureChange }) => {
  const { gesture, handPosition, isDetecting, cameraRef, canvasRef, startDetection } = useHandDetection();

  React.useEffect(() => {
    onGestureChange({ gesture, handPosition });
  }, [gesture, handPosition, onGestureChange]);

  return (
    <div className="camera-section">
      <h2 className="section-title">Conductor's Podium</h2>
      <div className="camera-container">
        <video ref={cameraRef} className="camera-feed" playsInline></video>
        <canvas ref={canvasRef} className="conductor-canvas"></canvas>
      </div>
      
      <div className="controls">
        <button 
          className="start-camera" 
          onClick={startDetection}
          disabled={isDetecting}
        >
          {isDetecting ? 'Camera Active' : 'Start Camera'}
        </button>
        
        <div className="gesture-info">
          <p>Current Gesture: <span className="gesture-text">{gesture}</span></p>
          
        </div>
      </div>
    </div>
  );
};

export default Conductor;