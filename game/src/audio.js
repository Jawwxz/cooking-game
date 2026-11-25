// Tiny kitchen sounds from the Web Audio oscillator: no audio files, no network.
// Everything is guarded, so a browser without audio (or a screenshot run) just stays silent.
export function createAudio() {
  let ctx = null;
  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
    return ctx;
  }
  function tone(freq, seconds, type, gain) {
    const ac = ensure();
    if (!ac || ac.state === 'suspended') return;
    try {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain || 0.08, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + seconds);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + seconds);
    } catch {
      // Sound is garnish; a failure never stops the game.
    }
  }
  return {
    unlock() {
      const ac = ensure();
      if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
    },
    pickup() { tone(520, 0.08, 'triangle', 0.06); },
    chop() { tone(180, 0.07, 'square', 0.05); tone(120, 0.06, 'square', 0.04); },
    sizzle() { tone(2400, 0.12, 'sawtooth', 0.015); },
    ding() { tone(880, 0.18, 'sine', 0.09); tone(1320, 0.22, 'sine', 0.06); },
    coin() { tone(990, 0.09, 'triangle', 0.08); tone(1480, 0.16, 'triangle', 0.07); },
    error() { tone(140, 0.16, 'square', 0.06); },
    lost() { tone(220, 0.3, 'sawtooth', 0.07); tone(165, 0.4, 'sawtooth', 0.06); },
  };
}
