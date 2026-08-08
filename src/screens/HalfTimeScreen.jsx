import { useEffect, useState } from 'react';
import { useMatchState, useMatchDispatch } from '../state/MatchContext';
import { useTicker } from '../hooks/useTicker';
import { useWakeLock } from '../hooks/useWakeLock';
import { getElapsedMs, formatClock } from '../utils/time';
import { playAlertBeep, vibrateAlert } from '../utils/audio';
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
    <div className="screen center-screen">
      <div className="card">
        <h1>Half Time</h1>
        <div className={`clock-display${timeUp ? ' clock-over' : ''}`}>
          <div className="clock-label">{timeUp ? "Time's up" : 'Break remaining'}</div>
          <div className="clock-time">{formatClock(remaining)}</div>
        </div>
        <p className="muted">Player total playing time is paused and will resume in the 2nd half.</p>
        <div className="stack-buttons">
          <button className="btn btn-primary btn-large" onClick={() => dispatch({ type: 'START_SECOND_HALF' })}>
            Start 2nd Half
          </button>
          <button className="btn btn-danger-outline" onClick={() => setShowEndDialog(true)}>
            End Match
          </button>
        </div>
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
