// Pure client-side CSV report generator, read-only against MatchContext
// state — no server, no new dependency. Called once, right when the
// End Match hold-to-confirm completes, before the state wipe.
import { getElapsedMs, formatClock } from './time';

function csvField(value) {
  const str = String(value ?? '');
  // Quote anything with a comma, quote, or newline, per RFC 4180.
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(values) {
  return values.map(csvField).join(',');
}

function dateStamp(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildMatchReportFilename(date = new Date()) {
  return `football-report-${dateStamp(date)}.csv`;
}

// One row per player who appeared at any point (on-field, bench, or
// injured), sorted by total minutes played descending. If a player is still
// on the field when the report is generated (End Match hit mid-stint), their
// live stint is banked into the total the same way OnFieldList already
// displays it — read-only, no dispatch, matchReducer's own totalSeconds is
// untouched by this.
export function buildMatchReportCsv(state, { now = Date.now(), date = new Date() } = {}) {
  const masterElapsed = getElapsedMs(state.clock, now);

  const rows = state.players.map((p) => {
    const liveStintSeconds =
      p.status === 'field' && p.stintStartElapsedMs != null
        ? Math.max(0, (masterElapsed - p.stintStartElapsedMs) / 1000)
        : 0;
    return {
      number: p.number,
      totalMinutes: (p.totalSeconds + liveStintSeconds) / 60,
      stintCount: p.stintCount || 0,
      everInjured: !!p.everInjured,
    };
  });

  rows.sort((a, b) => b.totalMinutes - a.totalMinutes);

  // masterElapsed is the app's own clock: it pauses for stoppages and for
  // half-time, and never resets between halves (see matchReducer.js), so
  // it's exactly "how long the match actually was" on the timer the coach
  // was watching — not the configured half length, which is just the plan.
  const actualMatchTime = formatClock(masterElapsed);

  const lines = [
    csvRow([
      `Match report — ${dateStamp(date)} — Actual match time ${actualMatchTime} (ended in Half ${state.half}) — Half length used ${state.halfLengthMin} min — Field slots ${state.fieldSlots}`,
    ]),
    csvRow(['Shirt Number', 'Total Minutes', 'Stints', 'Injured']),
    ...rows.map((r) => csvRow([r.number, r.totalMinutes.toFixed(1), r.stintCount, r.everInjured ? 'yes' : 'no'])),
  ];

  return lines.join('\r\n') + '\r\n';
}
