import { useHoldToConfirm } from '../hooks/useHoldToConfirm';
import Icon from './Icon';

// 2.8s continuous press, real touch events, resets to zero (not paused) on
// early release — see useHoldToConfirm for the mechanics. A tappable button
// here was the exact failure mode this replaces: a coach mis-firing "End
// Match" one-handed in the adrenaline of full time.
const HOLD_DURATION_MS = 2800;

export default function EndMatchDialog({ onConfirm, onCancel }) {
  const { ref, progress, holding } = useHoldToConfirm({ duration: HOLD_DURATION_MS, onConfirm });
  const pct = Math.round(progress * 100);

  let label = 'Hold to End Match';
  if (holding) label = pct >= 92 ? 'Ending…' : 'Keep holding…';

  return (
    <div className="modal-backdrop" onClick={holding ? undefined : onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <div className="warn-icon">
          <Icon name="warn" />
        </div>
        <h1>End the match?</h1>
        <p className="muted">
          This clears the clock, every substitution, and every player's playing time from this
          device. It can't be undone.
        </p>

        <button
          ref={ref}
          type="button"
          className="hold-btn"
          aria-label={`Hold for ${Math.round(HOLD_DURATION_MS / 1000)} seconds to end the match`}
        >
          <span className="hold-fill" style={{ width: `${pct}%` }} />
          <span className="hold-label">
            <Icon name="lock" />
            {label}
          </span>
        </button>

        <button className="btn btn-ghost" style={{ marginTop: '0.75rem' }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
