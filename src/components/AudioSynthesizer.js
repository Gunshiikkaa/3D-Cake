class AudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.melodyTimeout = null;
    this.tempo = 120; // BPM
    this.noteIndex = 0;
    this.volume = 0.4;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    
    // Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

    // Delay Node for dreamy room reverb/echo
    const delay = this.audioCtx.createDelay(1.0);
    delay.delayTime.value = 0.35;
    
    const feedback = this.audioCtx.createGain();
    feedback.gain.value = 0.4; // feedback amount

    // Connect nodes
    // Synth -> Delay -> Feedback -> Delay
    // Synth -> masterGain -> Destination
    // Delay -> masterGain
    delay.connect(feedback);
    feedback.connect(delay);
    
    this.masterGain.connect(this.audioCtx.destination);
    delay.connect(this.masterGain);

    this.delayNode = delay;
    this.feedbackNode = feedback;
  }

  playTone(freq, time, duration, type = 'triangle') {
    if (!this.audioCtx) return;

    // Main oscillator for the note
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    // Envelope for a music box sound (fast attack, slow exponential decay)
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.8, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.02);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    if (this.delayNode) {
      gainNode.connect(this.delayNode); // feed into delay
    }

    osc.start(time);
    osc.stop(time + duration);

    // High harmonic for music box 'tinkle' ring
    const harmonicOsc = this.audioCtx.createOscillator();
    const harmonicGain = this.audioCtx.createGain();

    harmonicOsc.type = 'sine';
    harmonicOsc.frequency.setValueAtTime(freq * 2, time); // 1 octave up

    harmonicGain.gain.setValueAtTime(0, time);
    harmonicGain.gain.linearRampToValueAtTime(0.2, time + 0.01);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.5);

    harmonicOsc.connect(harmonicGain);
    harmonicGain.connect(this.masterGain);

    harmonicOsc.start(time);
    harmonicOsc.stop(time + duration * 0.5);
  }

  playChord(frequencies, time, duration) {
    frequencies.forEach(freq => {
      // Arpeggiate chord notes slightly for music box feel
      const arpOffset = Math.random() * 0.05;
      this.playTone(freq, time + arpOffset, duration, 'sine');
    });
  }

  start() {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.noteIndex = 0;
    this.scheduleNextNotes();
  }

  stop() {
    this.isPlaying = false;
    if (this.melodyTimeout) {
      clearTimeout(this.melodyTimeout);
      this.melodyTimeout = null;
    }
    if (this.audioCtx) {
      this.audioCtx.suspend();
    }
  }

  setVolume(val) {
    this.volume = val;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(val, this.audioCtx.currentTime);
    }
  }

  scheduleNextNotes() {
    if (!this.isPlaying || !this.audioCtx) return;

    const lookAhead = 0.5; // schedule notes 500ms ahead
    const scheduleTime = this.audioCtx.currentTime + 0.05;

    // Melody: Happy Birthday in F major
    // Note format: [ frequency, duration_in_beats, chord_frequencies_optional ]
    const C4 = 261.63;
    const D4 = 293.66;
    const E4 = 329.63;
    const F4 = 349.23;
    const G4 = 392.00;
    const A4 = 440.00;
    const Bb4 = 466.16;
    const C5 = 523.25;
    const F3 = 174.61;
    const A3 = 220.00;
    const C3 = 130.81;
    const G3 = 196.00;
    const Bb3 = 233.08;

    const melody = [
      // Happy birthday to you
      [C4, 0.75, [F3, A3]], [C4, 0.25], [D4, 1.0], [C4, 1.0], [F4, 1.0], [E4, 2.0, [C3, G3, C4]],
      
      // Happy birthday to you
      [C4, 0.75, [C3, G3]], [C4, 0.25], [D4, 1.0], [C4, 1.0], [G4, 1.0], [F4, 2.0, [F3, A3, C4]],
      
      // Happy birthday dear [Name]
      [C4, 0.75, [F3, A3]], [C4, 0.25], [C5, 1.0], [A4, 1.0], [F4, 1.0], [E4, 1.0, [Bb3, D4]], [D4, 2.0, [Bb3, D4]],
      
      // Happy birthday to you
      [Bb4, 0.75, [Bb3, D4]], [Bb4, 0.25], [A4, 1.0, [F3, C4]], [F4, 1.0], [G4, 1.0], [F4, 2.0, [F3, A3, C4]],
      
      // Extra bridge tinkle (sweet music box scale)
      [C5, 0.5, [C3, E3, G3]], [E4, 0.5], [G4, 0.5], [C5, 0.5], [E5, 1.0], [F5, 2.0, [F3, A3, C4]]
    ];

    let currentScheduleTime = scheduleTime;
    const beatDuration = 60 / this.tempo; // time of 1 beat in seconds

    // Schedule 8 steps at a time to prevent lag
    for (let i = 0; i < 6; i++) {
      const idx = (this.noteIndex + i) % melody.length;
      const [freq, beats, chord] = melody[idx];
      const duration = beats * beatDuration;

      // Play melody note
      this.playTone(freq, currentScheduleTime, duration * 0.95);

      // Play supporting chord if present
      if (chord) {
        this.playChord(chord, currentScheduleTime, duration * 2.0);
      }

      currentScheduleTime += duration;
    }

    // Set timeout to schedule the next batch
    const batchDuration = (melody[this.noteIndex % melody.length][1] * beatDuration) * 1000;
    this.noteIndex = (this.noteIndex + 1) % melody.length;

    this.melodyTimeout = setTimeout(() => {
      this.scheduleNextNotes();
    }, batchDuration);
  }
}

export const synth = new AudioSynthesizer();
