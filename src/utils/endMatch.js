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
    // coach at full time needs the wipe to happen no matter what.
  } finally {
    dispatch({ type: 'END_MATCH' });
  }
}
