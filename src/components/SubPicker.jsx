import { formatMinSec } from '../utils/time';
import Icon from './Icon';

export default function SubPicker({ offPlayer, benchPlayers, onPick, onCancel }) {
  const sorted = [...benchPlayers].sort((a, b) => a.totalSeconds - b.totalSeconds);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h1 style={{ fontSize: '1.15rem' }}>
          Sub on for <span className="highlight">#{offPlayer.number}</span>
        </h1>
        <p className="muted small" style={{ marginTop: '-0.35rem', marginBottom: '0.9rem' }}>
          Bench, least-played first
        </p>
        {sorted.length === 0 ? (
          <p className="muted">No bench players available.</p>
        ) : (
          <div className="player-list">
            {sorted.map((p) => (
              <button key={p.id} className="btn bench-pick-btn" onClick={() => onPick(p.id)}>
                <span className="p-id">
                  <span className="icon-dot bench">
                    <Icon name="bench" />
                  </span>
                  <span className="p-num">#{p.number}</span>
                </span>
                <span className="meta">
                  {formatMinSec(p.totalSeconds)} played
                  <Icon name="chevron" className="chev" />
                </span>
              </button>
            ))}
          </div>
        )}
        <button className="btn btn-secondary btn-block" style={{ marginTop: '0.75rem' }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
