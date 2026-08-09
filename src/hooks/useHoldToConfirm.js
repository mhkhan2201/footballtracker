import { useCallback, useEffect, useRef, useState } from 'react';

// Press-and-hold confirmation gesture for destructive actions (End Match).
// Deliberately NOT a tap — a coach at full-time adrenaline shouldn't be able
// to end the match with a single mis-fired tap.
//
// - Real touch events (touchstart/touchend/touchcancel), not mouse-only —
//   plus mousedown/mouseup as a desktop/dev-tools fallback, never a
//   replacement.
// - Registered with addEventListener({ passive: false }) rather than React's
//   synthetic touch props, because React attaches onTouchStart as a passive
//   listener by default (matches browser default for scroll perf), which
//   silently no-ops preventDefault(). Non-passive is required for
//   preventDefault() to actually stop iOS's long-press callout / selection.
// - Progress is driven by requestAnimationFrame against a real start
//   timestamp (performance.now()), so it isn't tied to a ticking counter.
// - Releasing early (touchend/touchcancel/mouseup/mouseleave) cancels and
//   resets progress straight to 0 — it never pauses mid-fill.
export function useHoldToConfirm({ duration = 2800, onConfirm, disabled = false }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0); // 0..1
  const [holding, setHolding] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const firedRef = useRef(false);

  const cancel = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setHolding(false);
    setProgress(0);
  }, []);

  const start = useCallback(() => {
    if (disabled || firedRef.current) return;
    startRef.current = performance.now();
    setHolding(true);
    setProgress(0);

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) {
        firedRef.current = true;
        rafRef.current = null;
        setHolding(false);
        onConfirm();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [disabled, duration, onConfirm]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const onPressStart = (e) => {
      // Blocks the iOS long-press context menu / text-selection gesture from
      // hijacking the hold. Only works because this listener is non-passive.
      e.preventDefault();
      start();
    };
    const onPressEnd = () => cancel();

    el.addEventListener('touchstart', onPressStart, { passive: false });
    el.addEventListener('touchend', onPressEnd, { passive: false });
    el.addEventListener('touchcancel', onPressEnd, { passive: false });
    el.addEventListener('mousedown', onPressStart);
    window.addEventListener('mouseup', onPressEnd);
    el.addEventListener('mouseleave', onPressEnd);

    return () => {
      el.removeEventListener('touchstart', onPressStart);
      el.removeEventListener('touchend', onPressEnd);
      el.removeEventListener('touchcancel', onPressEnd);
      el.removeEventListener('mousedown', onPressStart);
      window.removeEventListener('mouseup', onPressEnd);
      el.removeEventListener('mouseleave', onPressEnd);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [start, cancel]);

  return { ref, progress, holding };
}
