import { useEffect, useState } from 'react';

// Forces periodic re-renders so on-screen clocks stay live. The actual time
// values are always computed from Date.now() diffs (see utils/time.js), so a
// delayed or missed tick (backgrounded tab) never causes drift — it only
// means the display catches up next time it re-renders.
export function useTicker(intervalMs = 500, active = true) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);

  return now;
}
