import { getElapsedMs } from '../utils/time';
import { clearState } from '../utils/storage';

// --- Model ---------------------------------------------------------------
// A single continuous "master clock" (accumulatedMs/startedAt/running) tracks
// total match time-on-clock, pausable for stoppages. Half display time is
// derived as masterElapsed - halfStartElapsedMs, so "start 2nd half" just
// records a new offset instead of resetting anything — player stints, which
// are also anchored to master-elapsed timestamps, carry on seamlessly.
//
// Player.status: 'field' | 'bench' | 'injured'
// Player.stintStartElapsedMs: master-elapsed ms at which the current on-field
//   stint began (null unless status === 'field').
// Player.totalSeconds: banked playing time from completed stints.

function newClock(running = false) {
  return { running, startedAt: running ? Date.now() : null, accumulatedMs: 0 };
}

export function getInitialState() {
  return {
    phase: 'setup', // 'setup' | 'live' | 'halftime'
    half: 1,
    halfLengthMin: 25,
    fieldSlots: 7,
    reminderIntervalMin: 8, // null/0 = disabled
    players: [],
    clock: newClock(false),
    halfStartElapsedMs: 0,
    halfOverAlerted: false,
    halftimeClock: null,
    halftimeOverAlerted: false,
    reminder: { lastShownThreshold: 0, active: false },
  };
}

let idCounter = 1;
function makePlayer(number, status) {
  return {
    id: `p${idCounter++}`,
    number: String(number).trim(),
    status,
    stintStartElapsedMs: status === 'field' ? 0 : null,
    totalSeconds: 0,
    preInjuryStatus: null,
  };
}

export function matchReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE': {
      return action.payload;
    }

    case 'START_MATCH': {
      const { fieldSlots, halfLengthMin, reminderIntervalMin, fieldNumbers, benchNumbers } = action.payload;
      idCounter = 1;
      const players = [
        ...fieldNumbers.map((n) => makePlayer(n, 'field')),
        ...benchNumbers.map((n) => makePlayer(n, 'bench')),
      ];
      return {
        ...getInitialState(),
        phase: 'live',
        half: 1,
        halfLengthMin,
        fieldSlots,
        reminderIntervalMin,
        players,
        clock: newClock(true),
        halfStartElapsedMs: 0,
      };
    }

    case 'TOGGLE_CLOCK': {
      const now = Date.now();
      const c = state.clock;
      if (c.running) {
        return {
          ...state,
          clock: { running: false, startedAt: null, accumulatedMs: c.accumulatedMs + (now - c.startedAt) },
        };
      }
      return { ...state, clock: { running: true, startedAt: now, accumulatedMs: c.accumulatedMs } };
    }

    case 'SUB': {
      const { offId, onId } = action.payload;
      const now = Date.now();
      const masterElapsed = getElapsedMs(state.clock, now);
      const players = state.players.map((p) => {
        if (p.id === offId) {
          const stintSec = p.stintStartElapsedMs != null ? (masterElapsed - p.stintStartElapsedMs) / 1000 : 0;
          return {
            ...p,
            status: 'bench',
            stintStartElapsedMs: null,
            totalSeconds: p.totalSeconds + Math.max(0, stintSec),
          };
        }
        if (p.id === onId) {
          return { ...p, status: 'field', stintStartElapsedMs: masterElapsed };
        }
        return p;
      });
      return { ...state, players };
    }

    case 'BRING_ON': {
      const { id } = action.payload;
      const onFieldCount = state.players.filter((p) => p.status === 'field').length;
      if (onFieldCount >= state.fieldSlots) return state;
      const now = Date.now();
      const masterElapsed = getElapsedMs(state.clock, now);
      const players = state.players.map((p) =>
        p.id === id ? { ...p, status: 'field', stintStartElapsedMs: masterElapsed } : p
      );
      return { ...state, players };
    }

    case 'MARK_INJURED': {
      const { id } = action.payload;
      const now = Date.now();
      const masterElapsed = getElapsedMs(state.clock, now);
      const players = state.players.map((p) => {
        if (p.id !== id) return p;
        if (p.status === 'field') {
          const stintSec = p.stintStartElapsedMs != null ? (masterElapsed - p.stintStartElapsedMs) / 1000 : 0;
          return {
            ...p,
            status: 'injured',
            preInjuryStatus: 'field',
            stintStartElapsedMs: null,
            totalSeconds: p.totalSeconds + Math.max(0, stintSec),
          };
        }
        return { ...p, status: 'injured', preInjuryStatus: p.status };
      });
      return { ...state, players };
    }

    case 'UN_INJURE': {
      // Always returns to the bench — the coach can "Bring On" from there
      // once a field slot is free, which avoids ever exceeding fieldSlots.
      const { id } = action.payload;
      const players = state.players.map((p) =>
        p.id === id ? { ...p, status: 'bench', preInjuryStatus: null } : p
      );
      return { ...state, players };
    }

    case 'HALF_TIME_START': {
      const now = Date.now();
      const c = state.clock;
      const accumulatedMs = c.accumulatedMs + (c.running ? now - c.startedAt : 0);
      return {
        ...state,
        phase: 'halftime',
        clock: { running: false, startedAt: null, accumulatedMs },
        halftimeClock: { running: true, startedAt: now, accumulatedMs: 0 },
        halftimeOverAlerted: false,
      };
    }

    case 'START_SECOND_HALF': {
      const now = Date.now();
      const masterElapsed = state.clock.accumulatedMs; // paused during halftime
      return {
        ...state,
        phase: 'live',
        half: 2,
        clock: { running: true, startedAt: now, accumulatedMs: masterElapsed },
        halfStartElapsedMs: masterElapsed,
        halfOverAlerted: false,
        halftimeClock: null,
        reminder: { lastShownThreshold: 0, active: false },
      };
    }

    case 'SET_HALF_OVER_ALERTED':
      return { ...state, halfOverAlerted: true };

    case 'SET_HALFTIME_OVER_ALERTED':
      return { ...state, halftimeOverAlerted: true };

    case 'SET_REMINDER_THRESHOLD':
      return { ...state, reminder: { lastShownThreshold: action.payload.threshold, active: true } };

    case 'DISMISS_REMINDER':
      return { ...state, reminder: { ...state.reminder, active: false } };

    case 'END_MATCH':
      clearState();
      return getInitialState();

    default:
      return state;
  }
}
