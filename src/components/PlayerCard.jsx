import Icon from './Icon';

const STATUS_ICON = { field: 'onfield', bench: 'bench', injured: 'injured' };
const RANK_CLASS = { field: 'up', bench: 'next' };

// On-field cards get a dark near-black "readout chip" for the stint time —
// the one number that's live, changing, and must survive worst-case glare.
// Bench/injured totals are static once set, so they stay as plain ink text
// on the card's tint, matching everything else on screen.
export default function PlayerCard({ number, status, time, timeLabel, actions = [], emphasize = false, rankTag }) {
  const benchEmphClass = status === 'bench' && emphasize ? ' bench-emph' : '';

  return (
    <div className={`p-card ${status}${emphasize ? ' emph' : ''}${benchEmphClass}`}>
      <div className="p-row">
        <div className="p-id">
          <span className={`icon-dot ${status}`}>
            <Icon name={STATUS_ICON[status]} />
          </span>
          <span className="p-num">#{number}</span>
          {rankTag && <span className={`tag-mini ${RANK_CLASS[status] || 'up'}`}>{rankTag}</span>}
        </div>

        {status === 'field' ? (
          <div className="stint-readout">
            <span className="val">{time}</span>
            {timeLabel && <span className="cap">{timeLabel}</span>}
          </div>
        ) : (
          <div className="p-time">
            <div className="val">{time}</div>
            {timeLabel && <div className="cap">{timeLabel}</div>}
          </div>
        )}
      </div>

      {actions.length > 0 && (
        <div className="p-actions">
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
