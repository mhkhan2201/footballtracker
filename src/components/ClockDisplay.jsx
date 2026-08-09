import { formatClock } from '../utils/time';
import Icon from './Icon';

// Background is the near-black --readout-bg token (see styles.css), not the
// Pitch Deep green used elsewhere — this is one of the two live, glare-
// critical numerals in the app. The "over" alert state is a separate red
// signal and isn't part of that green->black swap.
export default function ClockDisplay({ elapsedMs, isOver, running, onToggle, label }) {
  return (
    <div className={`clockzone${isOver ? ' over' : ''}`}>
      <div className="top">
        <span className="eyebrow">
          {label} · {isOver ? 'Time Up' : running ? 'Live' : 'Paused'}
        </span>
        {isOver && (
          <span className="flag">
            <Icon name="warn" /> STOPPAGE
          </span>
        )}
      </div>
      <div className="num">{formatClock(elapsedMs)}</div>
      <button className={`ctrl ${running ? 'pause-ctrl' : 'resume-ctrl'}`} onClick={onToggle}>
        <Icon name={running ? 'pause' : 'play'} />
        {running ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}
