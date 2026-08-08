import { createContext, useContext, useEffect, useReducer } from 'react';
import { matchReducer, getInitialState } from './matchReducer';
import { saveState } from '../utils/storage';

const MatchStateContext = createContext(null);
const MatchDispatchContext = createContext(null);

export function MatchProvider({ initialState, children }) {
  const [state, dispatch] = useReducer(matchReducer, initialState || getInitialState());

  useEffect(() => {
    // Only persist while a match is actually in progress — the setup form
    // and a freshly-ended match have nothing worth resuming.
    if (state.phase === 'live' || state.phase === 'halftime') {
      saveState(state);
    }
  }, [state]);

  return (
    <MatchStateContext.Provider value={state}>
      <MatchDispatchContext.Provider value={dispatch}>{children}</MatchDispatchContext.Provider>
    </MatchStateContext.Provider>
  );
}

export function useMatchState() {
  const ctx = useContext(MatchStateContext);
  if (!ctx) throw new Error('useMatchState must be used within MatchProvider');
  return ctx;
}

export function useMatchDispatch() {
  const ctx = useContext(MatchDispatchContext);
  if (!ctx) throw new Error('useMatchDispatch must be used within MatchProvider');
  return ctx;
}
