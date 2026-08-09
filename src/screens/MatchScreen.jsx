import { useEffect, useState } from 'react';
import { useMatchState, useMatchDispatch } from '../state/MatchContext';
import { useTicker } from '../hooks/useTicker';
import { useWakeLock } from '../hooks/useWakeLock';
import { getElapsedMs } from '../utils/time';
import { playAlertBeep, vibrateAlert } from '../utils/audio';
import ClockDisplay from '../components/ClockDisplay';
import OnFieldList from '../components/OnFieldList';
import BenchList from '../components/BenchList';
import InjuredList from '../components/InjuredList';
import SubPicker from '../components/SubPicker';
import ReminderToast from '../components/ReminderToast';
import EndMatchDialog from '../components/EndMatchDialog';
import { endMatchWithReport } from '../utils/endMatch';

export default function MatchScreen() {
  const state = useMatchState();
  const dispatch = useMatchDispatch();
  const now = useTicker(500, true);
  useWakeLock(true);

  const [subOffId, setSubOffId] = useState(null);
  const [showEndDialog, setShowEndDialog] = useState(false);

  const masterElapsed = getElapsedMs(state.clock, now);
  const halfElapsed = masterElapsed - state.halfStartElapsedMs;
  const isOver = halfElapsed >= state.halfLengthMin * 60000;

  // Half-over alert: fire once per half when the clock crosses the target.
  useEffect(() => {
    if (isOver && !state.halfOverAlerted) {
      playAlertBeep();
      vibrateAlert();
      dispatch({ type: 'SET_HALF_OVER_ALERTED' });
    }
  }, [isOver, state.halfOverAlerted, dispatch]);

  // Substitution-check reminder toast, every N minutes of half time while running.
  useEffect(() => {
    if (!state.reminderIntervalMin || !state.clock.running) return;
    const intervalMs = state.reminderIntervalMin * 60000;
    const threshold = Math.floor(halfElapsed / intervalMs);
    if (threshold >= 1 && threshold > state.reminder.lastShownThreshold) {
      dispatch({ type: 'SET_REMINDER_THRESHOLD', payload: { threshold } });
    }
  }, [halfElapsed, state.reminderIntervalMin, state.clock.running, state.reminder.lastShownThreshold, dispatch]);

  const onFieldCount = state.players.filter((p) => p.status === 'field').length;
  const canBringOn = onFieldCount < state.fieldSlots;
  const offPlayer = subOffId ? state.players.find((p) => p.id === subOffId) : null;
  const benchCandidates = state.players.filter((p) => p.status === 'bench');

  return (
    <div className="screen match-screen">
      {state.reminder.active && (
        <ReminderToast onDismiss={() => dispatch({ type: 'DISMISS_REMINDER' })} />
      )}

      <div className="match-header">
        <ClockDisplay
          elapsedMs={halfElapsed}
          isOver={isOver}
          running={state.clock.running}
          onToggle={() => dispatch({ type: 'TOGGLE_CLOCK' })}
          label={`Half ${state.half}`}
        />
        <div className="header-buttons">
          {state.half === 1 && (
            <button className="btn btn-secondary" onClick={() => dispatch({ type: 'HALF_TIME_START' })}>
              Half Time
            </button>
          )}
          <button className="btn btn-danger-outline" onClick={() => setShowEndDialog(true)}>
            End Match
          </button>
        </div>
      </div>

      <OnFieldList
        players={state.players}
        masterElapsed={masterElapsed}
        onSubOff={setSubOffId}
        onInjure={(id) => dispatch({ type: 'MARK_INJURED', payload: { id } })}
      />

      <InjuredList
        players={state.players}
        onUninjure={(id) => dispatch({ type: 'UN_INJURE', payload: { id } })}
      />

      <BenchList
        players={state.players}
        canBringOn={canBringOn}
        onBringOn={(id) => dispatch({ type: 'BRING_ON', payload: { id } })}
        onInjure={(id) => dispatch({ type: 'MARK_INJURED', payload: { id } })}
      />

      {offPlayer && (
        <SubPicker
          offPlayer={offPlayer}
          benchPlayers={benchCandidates}
          onPick={(onId) => {
            dispatch({ type: 'SUB', payload: { offId: subOffId, onId } });
            setSubOffId(null);
          }}
          onCancel={() => setSubOffId(null)}
        />
      )}

      {showEndDialog && (
        <EndMatchDialog
          onConfirm={() => endMatchWithReport(state, dispatch)}
          onCancel={() => setShowEndDialog(false)}
        />
      )}
    </div>
  );
}
