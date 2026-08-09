import Icon from './Icon';

export default function ReminderToast({ onDismiss }) {
  return (
    <div className="banner" role="status">
      <Icon name="bell" />
      <span className="txt">Check who's played longest — time for a look at subs?</span>
      <button className="dismiss" onClick={onDismiss}>
        DISMISS
      </button>
    </div>
  );
}
