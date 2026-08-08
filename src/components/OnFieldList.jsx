import { formatMinSec } from '../utils/time';
import PlayerCard from './PlayerCard';

export default function OnFieldList({ players, masterElapsed, onSubOff, onInjure }) {
  const withStint = players
    .filter((p) => p.status === 'field')
    .map((p) => ({
      ...p,
      stintSeconds: p.stintStartElapsedMs != null ? Math.max(0, (masterElapsed - p.stintStartElapsedMs) / 1000) : 0,
    }))
    // Longest current stint most prominent — that's who's due a rest.
    .sort((a, b) => b.stintSeconds - a.stintSeconds);

  return (
    <section className="list-section">
      <h2>On Field ({withStint.length})</h2>
      {withStint.length === 0 && <p className="muted">No players on the field.</p>}
      <div className="player-list">
        {withStint.map((p, i) => (
          <PlayerCard
            key={p.id}
            number={p.number}
            status="field"
            time={formatMinSec(p.stintSeconds)}
            timeLabel="this stint"
            emphasize={i === 0}
            actions={[
              { label: 'Sub Off', variant: 'btn-primary', onClick: () => onSubOff(p.id) },
              { label: 'Injured', variant: 'btn-danger-outline', onClick: () => onInjure(p.id) },
            ]}
          />
        ))}
      </div>
    </section>
  );
}
