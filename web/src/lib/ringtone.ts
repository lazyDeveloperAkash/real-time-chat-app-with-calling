// Lightweight Web Audio ringtone/ringback — avoids shipping audio assets.
// Note: AudioContext may need a prior user gesture to produce sound in some browsers.

let ctx: AudioContext | null = null;
let interval: ReturnType<typeof setInterval> | null = null;

function beep(freq: number, durationMs: number, volume = 0.12) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

export function startRing(kind: "incoming" | "outgoing") {
  stopRing();
  try {
    ctx = ctx ?? new (window.AudioContext || (window as any).webkitAudioContext)();
    void ctx.resume();
  } catch {
    return;
  }
  const play = () => {
    if (kind === "incoming") {
      beep(880, 300);
      setTimeout(() => beep(880, 300), 420);
    } else {
      beep(440, 400, 0.08);
    }
  };
  play();
  interval = setInterval(play, kind === "incoming" ? 2000 : 3200);
}

export function stopRing() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
