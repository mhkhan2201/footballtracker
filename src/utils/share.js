// Offers the generated CSV report to the user as a direct file download.
//
// This previously tried the Web Share API (navigator.share) first, since it
// offers a richer "Save to Files / Message / AirDrop" sheet on mobile. On a
// real Android Chrome device that path produced a second, unwanted file
// alongside the CSV (a stray text file) — most likely the OS share sheet or
// whichever target app handled it creating a companion preview/text copy
// for the 'text/csv' MIME type, which isn't something under this app's
// control once navigator.share() hands the file off, and isn't something
// reproducible/verifiable from here without the device in hand. Rather than
// keep chasing share-target-specific behavior, this now always uses a
// single, deterministic Blob + <a download> link — one file, every time,
// on every browser, with no OS-level handoff involved.

const UTF8_BOM = '\uFEFF';

export function downloadFile(filename, content, mimeType) {
  // Prepend a UTF-8 BOM for CSV specifically: Excel doesn't assume UTF-8 for
  // a BOM-less .csv, so the em dashes in the report's header line render as
  // mojibake (â€”) instead of "—". Plain text editors and the phone's own
  // file viewer ignore a leading BOM harmlessly, so this is safe everywhere.
  const isCsv = mimeType.includes('csv');
  const body = isCsv ? UTF8_BOM + content : content;
  const type = mimeType.includes('charset') ? mimeType : `${mimeType};charset=utf-8`;
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke shortly after, not immediately — revoking synchronously can
  // cancel the download in some browsers before it actually starts.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
