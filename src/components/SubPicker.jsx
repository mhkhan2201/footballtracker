import { formatMinSec } from '../utils/time';

export default function SubPicker({ offPlayer, benchPlayers, onPick, onCancel }) {
  const sorted = [...benchPlayers].sort((a, b) => a.totalSeconds - b.totalSeconds);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          Sub on for <span className="highlight">#{offPlayer.number}</span>
        </h2>
        {sorted.length === 0 ? (
          <p className="muted">No bench players available.</p>
        ) : (
          <div className="player-list">
            {sorted.map((p) => (
              <button key={p.id} className="btn bench-pick-btn" onClick={() => onPick(p.id)}>
                <span className="player-number">#{p.number}</span>
                <span className="player-time-label">{formatMinSec(p.totalSeconds)} played</span>
              </button>
            ))}
          </div>
        )}
        <button className="btn btn-secondary btn-block" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
