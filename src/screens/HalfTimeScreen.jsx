import { useEffect, useState } from 'react';
import { useMatchState, useMatchDispatch } from '../state/MatchContext';
import { useTicker } from '../hooks/useTicker';
import { useWakeLock } from '../hooks/useWakeLock';
import { getElapsedMs, formatClock } from '../utils/time';
import { playAlertBeep, vibrateAlert } from '../utils/audio';
import Icon from '../components/Icon';
import EndMatchDialog from '../components/EndMatchDialog';

export default function HalfTimeScreen() {
  const state = useMatchState();
  const dispatch = useMatchDispatch();
  const now = useTicker(500, true);
  useWakeLock(true);
  const [showEndDialog, setShowEndDialog] = useState(false);

  const targetMs = state.halfLengthMin * 60000;
  const elapsed = getElapsedMs(state.halftimeClock, now);
  const remaining = targetMs - elapsed;
  const timeUp = remaining <= 0;

  useEffect(() => {
    if (timeUp && !state.halftimeOverAlerted) {
      playAlertBeep();
      vibrateAlert();
      dispatch({ type: 'SET_HALFTIME_OVER_ALERTED' });
    }
  }, [timeUp, state.halftimeOverAlerted, dispatch]);

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className={`ht-hero${timeUp ? ' over' : ''}`}>
        {timeUp && <Icon name="warn" className="icon" style={{ width: 28, height: 28 }} />}
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,.68)' }}>
          Half Time · {timeUp ? "Time's Up" : 'Break'}
        </span>
        <div className="num">{formatClock(remaining)}</div>
        <p className="cap">
          {timeUp
            ? "Beep + vibration fired once. Whenever you're ready —"
            : 'Player totals are paused and will resume the moment the 2nd half starts.'}
        </p>
        <button
          className="btn btn-large"
          style={{ background: 'var(--chalk)', color: timeUp ? 'var(--red-800)' : 'var(--pitch-800)' }}
          onClick={() => dispatch({ type: 'START_SECOND_HALF' })}
        >
          Start 2nd Half
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-danger-outline btn-block" onClick={() => setShowEndDialog(true)}>
          End Match
        </button>
      </div>

      {showEndDialog && (
        <EndMatchDialog
          onConfirm={() => dispatch({ type: 'END_MATCH' })}
          onCancel={() => setShowEndDialog(false)}
        />
      )}
    </div>
  );
}
