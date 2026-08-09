import { buildMatchReportCsv, buildMatchReportFilename } from './csv';
import { shareOrDownloadFile } from './share';

// Runs once the End Match hold-to-confirm completes: generate the CSV,
// offer it via share/download, then wipe state — in that order, regardless
// of whether the coach actually saved the file (no "did you save it?" gate).
// Read-only against `state` right up to the final dispatch.
export async function endMatchWithReport(state, dispatch) {
  try {
    const filename = buildMatchReportFilename();
    const csv = buildMatchReportCsv(state);
    await shareOrDownloadFile(filename, csv, 'text/csv');
  } catch (e) {
    // Report generation/offering must never block ending the match — a
    // coach at full time needs the wipe to happen no matter what. This was
    // previously a silent catch, which is exactly how a real failure here
    // could look like "nothing happened" with zero trace. Logging is kept
    // permanently (not just for this investigation) since it's a genuine
    // last-resort safety net that should never fire in normal operation.
    console.error('[report] endMatchWithReport: report generation/offering failed unexpectedly ->', e && e.name, '-', e && e.message, e);
  } finally {
    dispatch({ type: 'END_MATCH' });
  }
}
