// Drift-free elapsed time helpers.
// A "clock" is { running, startedAt, accumulatedMs }. Elapsed time is always
// derived from Date.now() diffs against a real timestamp, never from counting
// setInterval ticks — so backgrounding the tab / locking the screen never
// causes drift, it just means fewer re-renders happen while it's hidden.

export function getElapsedMs(clock, now = Date.now()) {
  if (!clock) return 0;
  const running = clock.accumulatedMs + (clock.running ? Math.max(0, now - clock.startedAt) : 0);
  return running;
}

export function formatClock(ms, { showSign = false } = {}) {
  const sign = ms < 0 ? '-' : showSign ? '' : '';
  const totalSeconds = Math.max(0, Math.floor(Math.abs(ms) / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatMinSec(totalSeconds) {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
