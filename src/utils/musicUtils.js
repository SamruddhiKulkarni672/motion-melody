export class MusicPlayer {
  constructor() {
    this.audioContext = null;
    this.oscillators = [];
    this.gainNodes = [];
    this.isPlaying = false;
    this.tempo = 120;
    this.volume = 0.5;
  }

  init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create multiple oscillators for richer sound
    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Different waveforms for each oscillator
      oscillator.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'sawtooth';
      oscillator.frequency.value = 220 * (i + 1); // Different frequencies
      gainNode.gain.value = this.volume * (1 - i * 0.3); // Different volumes
      
      this.oscillators.push(oscillator);
      this.gainNodes.push(gainNode);
    }
  }

  start() {
    if (!this.audioContext) this.init();
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.oscillators.forEach(oscillator => {
      try {
        oscillator.start();
      } catch (e) {
        // Oscillator already started
      }
    });

    this.isPlaying = true;
    this.scheduleNotes();
  }

  stop() {
    if (this.audioContext) {
      this.audioContext.suspend();
      this.isPlaying = false;
    }
  }

  setTempo(tempo) {
    this.tempo = Math.max(40, Math.min(180, tempo));
  }

  setVolume(volume) {
    this.volume = Math.max(0.1, Math.min(1, volume));
    this.gainNodes.forEach((gainNode, index) => {
      if (gainNode) {
        gainNode.gain.value = this.volume * (1 - index * 0.3);
      }
    });
  }

  scheduleNotes() {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const beatDuration = 60 / this.tempo;

     
    const melody = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    
    melody.forEach((note, index) => {
      const time = now + index * beatDuration * 0.5;
      
      this.oscillators.forEach((oscillator, oscIndex) => {
        if (oscillator && oscillator.frequency) {
          // Create harmonies by using different intervals
          const harmonyNote = note * (oscIndex + 1) * 0.5;
          oscillator.frequency.setValueAtTime(harmonyNote, time);
        }
      });
    });

    // Schedule next sequence
    setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleNotes();
      }
    }, melody.length * beatDuration * 0.5 * 1000);
  }
}

export const createMusicParticles = (count, tempo) => {
  const particles = [];
  const speed = tempo / 120; // Normalize to 120 BPM

  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 2 * speed
    });
  }

  return particles;
};