export default function EndMatchDialog({ onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>End match?</h2>
        <p className="muted">
          This clears all match data from this device — the clock, subs, and every player's
          playing time. This can't be undone.
        </p>
        <div className="stack-buttons">
          <button className="btn btn-danger btn-large" onClick={onConfirm}>
            End Match &amp; Clear Data
          </button>
          <button className="btn btn-secondary btn-large" onClick={onCancel}>
            Keep Going
          </button>
        </div>
      </div>
    </div>
  );
}
