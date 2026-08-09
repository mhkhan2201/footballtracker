import { useState } from 'react';
import { useMatchDispatch } from '../state/MatchContext';
import { unlockAudio } from '../utils/audio';

function makeArray(n, fill = '') {
  return Array.from({ length: n }, () => fill);
}

export default function SetupScreen() {
  const dispatch = useMatchDispatch();

  const [fieldSlots, setFieldSlots] = useState(7);
  const [halfLengthMin, setHalfLengthMin] = useState(25);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderIntervalMin, setReminderIntervalMin] = useState(8);
  const [fieldNumbers, setFieldNumbers] = useState(makeArray(7));
  const [benchNumbers, setBenchNumbers] = useState(makeArray(3));
  const [error, setError] = useState('');

  function resizeFieldSlots(n) {
    const clamped = Math.max(1, Math.min(15, Number(n) || 0));
    setFieldSlots(clamped);
    setFieldNumbers((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) next.push('');
      return next;
    });
  }

  function updateFieldNumber(i, value) {
    setFieldNumbers((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function updateBenchNumber(i, value) {
    setBenchNumbers((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function addBenchSlot() {
    setBenchNumbers((prev) => [...prev, '']);
  }

  function removeBenchSlot(i) {
    setBenchNumbers((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Anchor the AudioContext to this real tap, as early in the session as
    // possible — iOS Safari otherwise keeps it suspended and the half-time/
    // full-time beep fired later from a timer effect (not a user gesture)
    // would be silent. See utils/audio.js.
    unlockAudio();

    const trimmedField = fieldNumbers.map((v) => v.trim());
    const trimmedBench = benchNumbers.map((v) => v.trim()).filter((v) => v !== '');

    if (trimmedField.some((v) => v === '')) {
      setError(`All ${fieldSlots} field slots need a shirt number.`);
      return;
    }

    const all = [...trimmedField, ...trimmedBench];
    const seen = new Set();
    for (const num of all) {
      if (seen.has(num)) {
        setError(`Shirt number "${num}" is used more than once. Numbers must be unique.`);
        return;
      }
      seen.add(num);
    }

    dispatch({
      type: 'START_MATCH',
      payload: {
        fieldSlots,
        halfLengthMin: Math.max(1, Number(halfLengthMin) || 25),
        reminderIntervalMin: reminderEnabled ? Math.max(1, Number(reminderIntervalMin) || 8) : null,
        fieldNumbers: trimmedField,
        benchNumbers: trimmedBench,
      },
    });
  }

  return (
    <div className="screen">
      <div className="card">
        <h1>Match Setup</h1>

        <form onSubmit={handleSubmit}>
          <div className="stack-buttons" style={{ marginTop: 0, gap: '0.6rem' }}>
            <div className="stepper">
              <span className="lbl">FIELD SLOTS</span>
              <span className="val">
                <button type="button" className="stepbtn" onClick={() => resizeFieldSlots(fieldSlots - 1)} aria-label="Fewer field slots">
                  −
                </button>
                {fieldSlots}
                <button type="button" className="stepbtn" onClick={() => resizeFieldSlots(fieldSlots + 1)} aria-label="More field slots">
                  +
                </button>
              </span>
            </div>
            <div className="stepper">
              <span className="lbl">HALF LENGTH (MIN)</span>
              <span className="val">
                <button
                  type="button"
                  className="stepbtn"
                  onClick={() => setHalfLengthMin((v) => Math.max(1, Number(v) - 1))}
                  aria-label="Shorter half"
                >
                  −
                </button>
                {halfLengthMin}
                <button
                  type="button"
                  className="stepbtn"
                  onClick={() => setHalfLengthMin((v) => Number(v) + 1)}
                  aria-label="Longer half"
                >
                  +
                </button>
              </span>
            </div>
            <label className="field checkbox-row">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
              />
              <span>Substitution check reminder</span>
            </label>
            {reminderEnabled && (
              <div className="stepper">
                <span className="lbl">REMIND EVERY (MIN)</span>
                <span className="val">
                  <button
                    type="button"
                    className="stepbtn"
                    onClick={() => setReminderIntervalMin((v) => Math.max(1, Number(v) - 1))}
                    aria-label="Remind more often"
                  >
                    −
                  </button>
                  {reminderIntervalMin}
                  <button
                    type="button"
                    className="stepbtn"
                    onClick={() => setReminderIntervalMin((v) => Number(v) + 1)}
                    aria-label="Remind less often"
                  >
                    +
                  </button>
                </span>
              </div>
            )}
          </div>

          <h2>On the field ({fieldSlots})</h2>
          <div className="number-grid">
            {fieldNumbers.map((v, i) => (
              <input
                key={i}
                className="shirt-input"
                type="text"
                inputMode="numeric"
                placeholder={`#${i + 1}`}
                value={v}
                onChange={(e) => updateFieldNumber(i, e.target.value)}
              />
            ))}
          </div>

          <h2>Bench</h2>
          <div className="number-grid">
            {benchNumbers.map((v, i) => (
              <div className="shirt-input-wrap" key={i}>
                <input
                  className="shirt-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="#"
                  value={v}
                  onChange={(e) => updateBenchNumber(i, e.target.value)}
                />
                <button
                  type="button"
                  className="btn-remove-slot"
                  aria-label="Remove bench slot"
                  onClick={() => removeBenchSlot(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-secondary" onClick={addBenchSlot}>
            + Add bench player
          </button>

          {error && <p className="error-text" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-large btn-block start-btn">
            Start Match
          </button>
        </form>
      </div>
    </div>
  );
}
