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
//
// KNOWN-BUG NOTE (fixed): the caller (EndMatchDialog) is rendered inside
// MatchScreen/HalfTimeScreen, both of which re-render every ~500ms from the
// live clock ticker. If `onConfirm` — an inline arrow passed fresh every
// render — were a dependency of `start`, `start`'s identity would change on
// every tick, which would tear down and rebuild the listeners below (and
// cancel the in-flight rAF loop in the process, with nothing to resume it)
// several times over the course of a single hold. `onConfirm` is now read
// from a ref, kept current by its own tiny effect, specifically so `start`
// stays referentially stable across those ticks and the listener effect
// below only runs once per mount.
export function useHoldToConfirm({ duration = 2800, onConfirm, disabled = false }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0); // 0..1
  const [holding, setHolding] = useState(false);

  const rafRef = useRef(null);
  const startRef = useRef(0);
  const firedRef = useRef(false);
  // Re-entrancy guard as a ref, not the `holding` state — reading/writing a
  // ref is synchronous, so a second start() call arriving before the next
  // render can still see it. Deliberately NOT a dependency of `start`, so
  // toggling it never triggers the listener effect to rebind.
  const holdingRef = useRef(false);
  // True for ~500ms after a real touchstart, so a synthetic mousedown some
  // mobile browsers fire shortly after (even with preventDefault() called)
  // never reaches start() — a single physical press can only ever start
  // the hold once.
  const touchActiveRef = useRef(false);
  const touchActiveTimerRef = useRef(null);

  const onConfirmRef = useRef(onConfirm);
  useEffect(() => {
    onConfirmRef.current = onConfirm;
  }, [onConfirm]);

  const cancel = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    holdingRef.current = false;
    setHolding(false);
    setProgress(0);
  }, []);

  const start = useCallback(() => {
    if (disabled || firedRef.current || holdingRef.current) return;
    // Belt-and-suspenders alongside the guard above: never let a second
    // call leave a previous rAF loop orphaned and uncancelable.
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    holdingRef.current = true;
    startRef.current = performance.now();
    setHolding(true);
    setProgress(0);

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) {
        firedRef.current = true;
        holdingRef.current = false;
        rafRef.current = null;
        setHolding(false);
        onConfirmRef.current();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [disabled, duration]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const onTouchPressStart = (e) => {
      // Blocks the iOS long-press context menu / text-selection gesture from
      // hijacking the hold. Only works because this listener is non-passive.
      e.preventDefault();
      touchActiveRef.current = true;
      if (touchActiveTimerRef.current) clearTimeout(touchActiveTimerRef.current);
      touchActiveTimerRef.current = setTimeout(() => {
        touchActiveRef.current = false;
      }, 500);
      start();
    };
    const onMousePressStart = (e) => {
      // Ignore a mousedown that arrives while a touch interaction is active
      // on this element — some mobile browsers synthesize one shortly after
      // touchstart regardless of preventDefault(). Real mouse input (desktop
      // / dev tools) is unaffected since touchActiveRef is never set there.
      if (touchActiveRef.current) return;
      e.preventDefault();
      start();
    };
    const onPressEnd = () => cancel();

    el.addEventListener('touchstart', onTouchPressStart, { passive: false });
    el.addEventListener('touchend', onPressEnd, { passive: false });
    el.addEventListener('touchcancel', onPressEnd, { passive: false });
    el.addEventListener('mousedown', onMousePressStart);
    window.addEventListener('mouseup', onPressEnd);
    el.addEventListener('mouseleave', onPressEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchPressStart);
      el.removeEventListener('touchend', onPressEnd);
      el.removeEventListener('touchcancel', onPressEnd);
      el.removeEventListener('mousedown', onMousePressStart);
      window.removeEventListener('mouseup', onPressEnd);
      el.removeEventListener('mouseleave', onPressEnd);
      if (touchActiveTimerRef.current) clearTimeout(touchActiveTimerRef.current);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [start, cancel]);

  return { ref, progress, holding };
}
