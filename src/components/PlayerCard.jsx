export default function PlayerCard({ number, time, timeLabel, status, actions = [], emphasize = false }) {
  return (
    <div className={`player-card status-${status}${emphasize ? ' emphasize' : ''}`}>
      <div className="player-card-main">
        <span className="player-number">#{number}</span>
        <span className="player-time">
          {time}
          {timeLabel && <span className="player-time-label">{timeLabel}</span>}
        </span>
      </div>
      {actions.length > 0 && (
        <div className="player-card-actions">
          {actions.map((a) => (
            <button
              key={a.label}
              className={`btn btn-small ${a.variant || 'btn-secondary'}`}
              onClick={a.onClick}
              disabled={a.disabled}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
