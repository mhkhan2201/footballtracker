import { useEffect, useRef, useState } from 'react';
import { MatchProvider, useMatchState } from './state/MatchContext';
import { getInitialState } from './state/matchReducer';
import { loadState, clearState } from './utils/storage';
import ResumePrompt from './screens/ResumePrompt';
import SetupScreen from './screens/SetupScreen';
import MatchScreen from './screens/MatchScreen';
import HalfTimeScreen from './screens/HalfTimeScreen';

function Screens() {
  const state = useMatchState();
  if (state.phase === 'halftime') return <HalfTimeScreen />;
  if (state.phase === 'live') return <MatchScreen />;
  return <SetupScreen />;
}

export default function App() {
  // Resolve what to boot with before rendering the provider: either a saved
  // in-progress match (pending a Resume/Start Fresh choice) or a clean slate.
  const savedRef = useRef(undefined);
  if (savedRef.current === undefined) {
    savedRef.current = loadState();
  }
  const saved = savedRef.current;
  const hasResumableMatch = saved && (saved.phase === 'live' || saved.phase === 'halftime');

  const [decision, setDecision] = useState(hasResumableMatch ? null : 'fresh');

  if (decision === null) {
    return (
      <ResumePrompt
        onResume={() => setDecision('resume')}
        onFresh={() => {
          clearState();
          setDecision('fresh');
        }}
      />
    );
  }

  const initialState = decision === 'resume' ? saved : getInitialState();

  return (
    <MatchProvider initialState={initialState}>
      <Screens />
    </MatchProvider>
  );
}
