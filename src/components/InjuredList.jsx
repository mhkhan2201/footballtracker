import { formatMinSec } from '../utils/time';
import PlayerCard from './PlayerCard';

export default function InjuredList({ players, onUninjure }) {
  const injured = players.filter((p) => p.status === 'injured');
  if (injured.length === 0) return null;

  return (
    <section className="list-section">
      <h2>Injured ({injured.length})</h2>
      <div className="player-list">
        {injured.map((p) => (
          <PlayerCard
            key={p.id}
            number={p.number}
            status="injured"
            time={formatMinSec(p.totalSeconds)}
            timeLabel="total played"
            actions={[{ label: 'Un-injure', variant: 'btn-primary', onClick: () => onUninjure(p.id) }]}
          />
        ))}
      </div>
    </section>
  );
}
