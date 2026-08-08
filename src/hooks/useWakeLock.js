import { useEffect, useRef } from 'react';

// Best-effort Screen Wake Lock with feature detection. If unsupported (older
// Safari, some Android browsers) this silently does nothing — the app still
// works, the coach just needs to tap the screen occasionally.
export function useWakeLock(active) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function requestLock() {
      if (!active) return;
      if (!('wakeLock' in navigator)) return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
        });
      } catch (e) {
        // Denied, unsupported, or low battery mode — nothing we can do.
      }
    }

    requestLock();

    // The lock is auto-released whenever the tab is hidden; re-request it
    // when the coach switches back.
    function handleVisibility() {
      if (active && document.visibilityState === 'visible' && !sentinelRef.current) {
        requestLock();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
    };
  }, [active]);
}
