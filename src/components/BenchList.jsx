import { formatMinSec } from '../utils/time';
import PlayerCard from './PlayerCard';

export default function BenchList({ players, canBringOn, onBringOn, onInjure }) {
  const bench = players
    .filter((p) => p.status === 'bench')
    // Least played most prominent — that's who should go on next.
    .sort((a, b) => a.totalSeconds - b.totalSeconds);

  return (
    <section className="list-section">
      <div className="list-eyebrow">
        <h2>Bench · {bench.length}</h2>
      </div>
      {bench.length === 0 && <p className="muted">No players on the bench.</p>}
      <div className="player-list">
        {bench.map((p, i) => (
          <PlayerCard
            key={p.id}
            number={p.number}
            status="bench"
            time={formatMinSec(p.totalSeconds)}
            timeLabel="Total"
            emphasize={i === 0}
            rankTag={i === 0 ? 'Up next' : null}
            actions={[
              {
                label: 'Bring On',
                variant: 'btn-primary',
                onClick: () => onBringOn(p.id),
                disabled: !canBringOn,
              },
              { label: 'Injured', variant: 'btn-danger-outline', onClick: () => onInjure(p.id) },
            ]}
          />
        ))}
      </div>
      {!canBringOn && bench.length > 0 && (
        <p className="muted small">Field is full — sub a player off to bring someone on.</p>
      )}
    </section>
  );
}
