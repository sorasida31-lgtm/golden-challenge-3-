// services/soundService.ts
let audioContext: AudioContext | null = null;

const initializeAudioContext = () => {
    // AudioContext is created on user interaction (click, etc.)
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
        }
    }
};

export const getMuteState = () => {
    return false; // Sound is always enabled
};


/**
 * Plays a simple 'boop' sound effect.
 * This is the '뿅' sound.
 */
export const playBoopSound = () => {
    if (getMuteState()) return;
    initializeAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.15);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
};

/**
 * Plays a 'sparkle' or 'magic' sound effect.
 * This is the '뾰로롱' sound.
 */
export const playSparkleSound = () => {
    if (getMuteState()) return;
    initializeAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const notes = [1046.50, 1318.51, 1567.98]; // C6, E6, G6 for a C major arpeggio

    notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, now + i * 0.06);
        gainNode.gain.setValueAtTime(0.4, now + i * 0.06);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.25);

        oscillator.start(now + i * 0.06);
        oscillator.stop(now + i * 0.06 + 0.25);
    });
};

/**
 * Plays a sound for unlocking something.
 * A metallic clink followed by a sparkle.
 */
export const playUnlockSound = () => {
    if (getMuteState()) return;
    initializeAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;

    // 1. Metallic Clink
    const clinkOsc = audioContext.createOscillator();
    const clinkGain = audioContext.createGain();
    clinkOsc.connect(clinkGain);
    clinkGain.connect(audioContext.destination);

    clinkOsc.type = 'square';
    clinkOsc.frequency.setValueAtTime(1200, now);
    clinkOsc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    clinkGain.gain.setValueAtTime(0.3, now);
    clinkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    clinkOsc.start(now);
    clinkOsc.stop(now + 0.1);

    // 2. Sparkle (delayed)
    const notes = [1046.50, 1318.51, 1567.98]; // C6, E6, G6
    notes.forEach((freq, i) => {
        const sparkleOsc = audioContext!.createOscillator();
        const sparkleGain = audioContext!.createGain();
        sparkleOsc.connect(sparkleGain);
        sparkleGain.connect(audioContext!.destination);
        
        const startTime = now + 0.1 + i * 0.06;

        sparkleOsc.type = 'triangle';
        sparkleOsc.frequency.setValueAtTime(freq, startTime);
        sparkleGain.gain.setValueAtTime(0.4, startTime);
        sparkleGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25);

        sparkleOsc.start(startTime);
        sparkleOsc.stop(startTime + 0.25);
    });
};

/**
 * Plays a short warning 'BEEP' sound.
 */
export const playWarningBeepSound = () => {
    if (getMuteState()) return;
    initializeAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'square'; // A more "digital" sound
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    // Short duration
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
};

/**
 * Plays a 4-step descending "power down" sound.
 * This is the '띠로리리' sound.
 */
export const playPowerDownSound = () => {
    if (getMuteState()) return;
    initializeAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;
    // Four descending notes
    const frequencies = [523.25, 440, 349.23, 261.63]; // C5, A4, F4, C4

    frequencies.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const startTime = now + i * 0.15; // Play each note after the previous one
        const duration = 0.15;

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    });
};

/**
 * Plays a positive sound for a correct answer.
 * A short, ascending C-major arpeggio.
 */
export const playCorrectSound = () => {
    if (getMuteState()) return;
    initializeAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now + i * 0.05);
        gainNode.gain.setValueAtTime(0.3, now + i * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.15);

        oscillator.start(now + i * 0.05);
        oscillator.stop(now + i * 0.05 + 0.15);
    });
};

/**
 * Plays a subtle negative sound for an incorrect answer.
 * A short, low-pitched buzz.
 */
export const playIncorrectSound = () => {
    if (getMuteState()) return;
    initializeAudioContext();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime); // Low frequency
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.15);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
};

/**
 * Plays a full victory celebration sound with fanfare, applause, and cheering.
 */
export const playVictoryCelebrationSound = () => {
    if (getMuteState()) return;
    initializeAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;

    // --- Fanfare ---
    const fanfareNotes = [
        { freq: 392.00, time: now, duration: 0.2 },        // G4
        { freq: 523.25, time: now + 0.2, duration: 0.2 },  // C5
        { freq: 659.25, time: now + 0.4, duration: 0.4 },  // E5
    ];

    fanfareNotes.forEach(note => {
        const osc = audioContext!.createOscillator();
        const gain = audioContext!.createGain();
        osc.connect(gain);
        gain.connect(audioContext!.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.freq, note.time);
        gain.gain.setValueAtTime(0.25, note.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.duration);

        osc.start(note.time);
        osc.stop(note.time + note.duration);
    });

    // --- Applause & Cheer Simulation ---
    const applauseDuration = 5.0; // Increased duration
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // Generate white noise
    }

    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1200;
    bandpass.Q.value = 1.5;

    const cheerBandpass = audioContext.createBiquadFilter();
    cheerBandpass.type = 'bandpass';
    cheerBandpass.frequency.value = 500;
    cheerBandpass.Q.value = 1;

    bandpass.connect(audioContext.destination);
    cheerBandpass.connect(audioContext.destination);

    // Create short, overlapping noise bursts for applause
    for (let i = 0; i < 70; i++) { // More bursts
        const source = audioContext.createBufferSource();
        source.buffer = noiseBuffer;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, now);
        const startTime = now + 0.5 + Math.random() * (applauseDuration - 0.5);
        gainNode.gain.linearRampToValueAtTime(Math.random() * 0.25, startTime + 0.01); // Louder
        gainNode.gain.linearRampToValueAtTime(0, startTime + 0.1 + Math.random() * 0.1);
        
        source.connect(gainNode);
        gainNode.connect(bandpass);
        source.start(startTime);
    }
    
    // Create a longer, sustained noise for cheering background
     const cheerSource = audioContext.createBufferSource();
     cheerSource.buffer = noiseBuffer;
     cheerSource.loop = true;
     const cheerGain = audioContext.createGain();
     cheerGain.gain.setValueAtTime(0, now);
     cheerGain.gain.linearRampToValueAtTime(0.15, now + 0.8); // Louder cheer
     cheerGain.gain.linearRampToValueAtTime(0, now + applauseDuration); // Fade out

     cheerSource.connect(cheerGain);
     cheerGain.connect(cheerBandpass);
     cheerSource.start(now + 0.5);
     cheerSource.stop(now + applauseDuration + 0.1);
};