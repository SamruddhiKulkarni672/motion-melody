import React from 'react';

const Controls = ({ onStartMusic, onPauseMusic, onTempoChange, tempo, isPlaying }) => {
  return (
    <div className="music-controls">
      <button onClick={onStartMusic} disabled={isPlaying}>
        Start Music
      </button>
      <button onClick={onPauseMusic} disabled={!isPlaying}>
        Pause Music
      </button>
      
      <div className="tempo-control">
        <label htmlFor="tempo-slider">Tempo: </label>
        <input
          id="tempo-slider"
          type="range"
          min="40"
          max="180"
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value))}
          className="tempo-slider"
        />
        <span>{tempo} BPM</span>
      </div>
    </div>
  );
};

export default Controls;