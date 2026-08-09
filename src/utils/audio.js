// Web Audio API beep + vibration for match/half-time alerts.
// No external assets — the beep is synthesized.

let audioCtx = null;

function getCtx() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

// iOS Safari only allows an AudioContext to make sound if it was created (or
// resumed) synchronously inside a real user-gesture handler at least once in
// the session. The half-time/full-time alert fires on its own from a timer
// effect, which is NOT a user gesture, so if this is the first thing to ever
// touch the AudioContext, iOS will keep it 'suspended' and the beep will be
// silent. Call this from an actual tap handler (e.g. "Start Match") as early
// as possible in the session to unlock it well before the alert needs it.
export function unlockAudio() {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) {
    // ignore
  }
}

export function playAlertBeep() {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const startAt = ctx.currentTime;
    const beepCount = 3;
    for (let i = 0; i < beepCount; i++) {
      const t = startAt + i * 0.35;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.45, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    }
  } catch (e) {
    // Audio can fail (autoplay policy, no user gesture yet) — never crash the app for a beep.
  }
}

export function vibrateAlert() {
  try {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
  } catch (e) {
    // ignore
  }
}
