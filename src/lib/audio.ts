// Synthesized banjo pluck using Web Audio API -- no audio files needed

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** Play a single banjo-like pluck note */
function pluck(freq: number, startTime: number, duration: number) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Square wave + low-pass gives a twangy pluck character
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, startTime);
  // Slight pitch bend down for realism
  osc.frequency.exponentialRampToValueAtTime(freq * 0.98, startTime + duration);

  // Sharp attack, quick decay -- like a string pluck
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.15, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  // Low-pass filter for that muted banjo tone
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, startTime);
  filter.frequency.exponentialRampToValueAtTime(400, startTime + duration * 0.7);
  filter.Q.setValueAtTime(2, startTime);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** Play a short banjo lick (a few plucked notes) */
export function playBanjoLick() {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    // Pentatonic banjo pattern: G4, B4, D5, G5, D5, B4
    const notes = [392, 494, 587, 784, 587, 494];
    const spacing = 0.12;
    const noteDuration = 0.2;

    notes.forEach((freq, i) => {
      pluck(freq, now + i * spacing, noteDuration);
    });
  } catch {
    // Audio not available -- silently skip
  }
}
