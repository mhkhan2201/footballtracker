export default function ReminderToast({ onDismiss }) {
  return (
    <div className="toast" role="status">
      <span>Check who's played longest — time for a look at subs?</span>
      <button className="btn btn-small btn-secondary" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
