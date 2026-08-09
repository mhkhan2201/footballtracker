import { buildMatchReportCsv, buildMatchReportFilename } from './csv';
import { downloadFile } from './share';

// Runs once the End Match hold-to-confirm completes: generate the CSV,
// download it, then wipe state — in that order, regardless of whether the
// coach actually looks at the download (no "did you save it?" gate).
// Read-only against `state` right up to the final dispatch.
export async function endMatchWithReport(state, dispatch) {
  try {
    const filename = buildMatchReportFilename();
    const csv = buildMatchReportCsv(state);
    downloadFile(filename, csv, 'text/csv');
  } catch (e) {
    // Report generation/download must never block ending the match — a
    // coach at full time needs the wipe to happen no matter what. Logging
    // is kept permanently (not just for one investigation) since this is a
    // genuine last-resort safety net that should never fire in normal
    // operation, and a silent catch here is exactly how a real failure
    // would look like "nothing happened" with zero trace.
    console.error('[report] endMatchWithReport: report generation/download failed unexpectedly ->', e && e.name, '-', e && e.message, e);
  } finally {
    dispatch({ type: 'END_MATCH' });
  }
}
