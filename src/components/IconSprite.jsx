// Inline SVG <symbol> defs, rendered once. Icons pair with color for every
// status (on-field/bench/injured/paused/warning) so the meaning survives
// even where color doesn't — direct glare or colorblindness.
export default function IconSprite() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <symbol id="i-onfield" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="7.5" fill="currentColor" />
        </symbol>
        <symbol id="i-bench" viewBox="0 0 24 24">
          <path
            d="M3 19V11.5C3 8 7 4.5 12 4.5S21 8 21 11.5V19H18V12.2C18 9.9 15.3 7.8 12 7.8S6 9.9 6 12.2V19H3Z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-injured" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M12 7.5V16.5M7.5 12H16.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-pause" viewBox="0 0 24 24">
          <rect x="6" y="5" width="4.2" height="14" rx="1" fill="currentColor" />
          <rect x="13.8" y="5" width="4.2" height="14" rx="1" fill="currentColor" />
        </symbol>
        <symbol id="i-play" viewBox="0 0 24 24">
          <path d="M7.5 5.2v13.6a1 1 0 0 0 1.53.85l10.7-6.8a1 1 0 0 0 0-1.7l-10.7-6.8a1 1 0 0 0-1.53.85Z" fill="currentColor" />
        </symbol>
        <symbol id="i-warn" viewBox="0 0 24 24">
          <path d="M12 3.5 21.5 20h-19L12 3.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <rect x="11.1" y="9.5" width="1.8" height="5.4" rx="0.9" fill="currentColor" />
          <circle cx="12" cy="17" r="1.15" fill="currentColor" />
        </symbol>
        <symbol id="i-bell" viewBox="0 0 24 24">
          <path
            d="M12 3.5c-1 0-1.8.8-1.8 1.8v.6C7.9 6.5 6.3 8.6 6.3 11v3.4L4.7 16.8c-.3.5.1 1.2.7 1.2h13.2c.6 0 1-.7.7-1.2L17.7 14.4V11c0-2.4-1.6-4.5-3.9-5.1v-.6c0-1-.8-1.8-1.8-1.8Z"
            fill="currentColor"
          />
          <path d="M9.6 18.6a2.4 2.4 0 0 0 4.8 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="i-chevron" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-lock" viewBox="0 0 24 24">
          <rect x="5.5" y="10.5" width="13" height="9.5" rx="1.6" fill="currentColor" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" />
        </symbol>
      </defs>
    </svg>
  );
}
