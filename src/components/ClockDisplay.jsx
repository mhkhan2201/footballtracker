import { formatClock } from '../utils/time';

export default function ClockDisplay({ elapsedMs, isOver, running, onToggle, label }) {
  return (
    <div className={`clock-display${isOver ? ' clock-over' : ''}`}>
      <div className="clock-label">{label}</div>
      <div className="clock-time">{formatClock(elapsedMs)}</div>
      {isOver && <div className="clock-over-flag">TIME UP — STOPPAGE</div>}
      <button className={`btn btn-large btn-block ${running ? 'btn-secondary' : 'btn-primary'}`} onClick={onToggle}>
        {running ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}
