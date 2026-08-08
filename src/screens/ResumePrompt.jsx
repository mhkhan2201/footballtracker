export default function ResumePrompt({ onResume, onFresh }) {
  return (
    <div className="screen center-screen">
      <div className="card">
        <h1>Match in progress found</h1>
        <p className="muted">
          It looks like a match was left running on this device — from a screen lock, tab
          switch, or refresh.
        </p>
        <div className="stack-buttons">
          <button className="btn btn-primary btn-large" onClick={onResume}>
            Resume match in progress
          </button>
          <button className="btn btn-danger-outline btn-large" onClick={onFresh}>
            Start fresh
          </button>
        </div>
      </div>
    </div>
  );
}
