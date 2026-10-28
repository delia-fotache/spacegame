// Sunet Sintetizat (Web Audio API sigur)
let audioCtx = null;
export function playSound(type) {
    try {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'star') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.11);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.11);
            osc.start(now);
            osc.stop(now + 0.11);
        } else if (type === 'bluestar') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
            gain.gain.setValueAtTime(0.16, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
        } else if (type === 'hit') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(55, now + 0.22);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
        } else if (type === 'explosion') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(25, now + 0.65);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
            osc.start(now);
            osc.stop(now + 0.75);
        } else if (type === 'gear') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(360, now);
            osc.frequency.exponentialRampToValueAtTime(960, now + 0.22);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
        } else if (type === 'win') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(660, now + 0.1);
            osc.frequency.setValueAtTime(880, now + 0.2);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        }
    } catch (e) {
        // Ignoră erorile audio
    }
}
