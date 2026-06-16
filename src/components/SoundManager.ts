class SoundManager {
  private ctx: AudioContext | null = null;
  private volume: number = 0.5;
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Interactivity will trigger initialization later
  }

  private initCtx() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.createNoiseBuffer();
      }
    } catch (e) {
      console.warn("Web Audio API is not supported in this environment", e);
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  getVolume() {
    return this.volume;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMute() {
    return this.isMuted;
  }

  private createGainNode(duration: number): { gainNode: GainNode; masterGain: GainNode } | null {
    this.initCtx();
    if (!this.ctx || this.isMuted || this.volume === 0) return null;

    // Wake context up if it was suspended (browser autoplays blocks)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);

    const gainNode = this.ctx.createGain();
    gainNode.connect(masterGain);

    return { gainNode, masterGain };
  }

  playShot() {
    const nodes = this.createGainNode(0.15);
    if (!nodes || !this.ctx) return;
    const { gainNode } = nodes;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gainNode);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playExplosion() {
    const nodes = this.createGainNode(0.6);
    if (!nodes || !this.ctx) return;
    const { gainNode } = nodes;

    // Use white noise if possible, else synthesized rumble
    if (this.noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.6);

      noiseSource.connect(filter);
      filter.connect(gainNode);

      gainNode.gain.setValueAtTime(0.8, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

      noiseSource.start();
      noiseSource.stop(this.ctx.currentTime + 0.6);
    } else {
      // Fallback
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(15, this.ctx.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.8, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

      osc.connect(gainNode);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    }
  }

  playHit() {
    const nodes = this.createGainNode(0.08);
    if (!nodes || !this.ctx) return;
    const { gainNode } = nodes;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gainNode);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPowerup() {
    const nodes = this.createGainNode(0.3);
    if (!nodes || !this.ctx) return;
    const { gainNode } = nodes;

    const t = this.ctx.currentTime;
    
    // Play 3 rapid scale notes
    const synthNote = (freq: number, start: number, dur: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0, start);
      noteGain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.01, start + dur);

      osc.connect(noteGain);
      noteGain.connect(gainNode);
      
      osc.start(start);
      osc.stop(start + dur);
    };

    synthNote(261.63, t, 0.1); // C4
    synthNote(329.63, t + 0.08, 0.1); // E4
    synthNote(392.00, t + 0.16, 0.15); // G4
    synthNote(523.25, t + 0.24, 0.2); // C5
  }

  playMineArmed() {
    const nodes = this.createGainNode(0.1);
    if (!nodes || !this.ctx) return;
    const { gainNode } = nodes;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gainNode);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playClick() {
    const nodes = this.createGainNode(0.05);
    if (!nodes || !this.ctx) return;
    const { gainNode } = nodes;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gainNode);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

export const soundManager = new SoundManager();
