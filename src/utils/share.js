// Offers a generated file to the user, preferring the Web Share API (better
// on mobile — Save to Files / Message / AirDrop / etc. all come for free)
// and falling back to a plain <a download> Blob link wherever share-with-
// files isn't supported (desktop browsers, some mobile browsers).
//
// A caller-dismissed share sheet (AbortError) is treated as a completed
// offer, not a failure — we don't force a second download on top of a
// sheet the coach deliberately closed. Any other share failure (including
// the file-sharing feature silently not actually being usable despite
// canShare() saying yes, or a lack of "user activation" if this runs too
// far removed from the original tap) falls through to the download path,
// so the coach still gets the file either way.
export async function shareOrDownloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });

  // TEMP DEBUG — instrumenting a real-device bug (share sheet never shows,
  // no download either). Filter the devtools console for "report-debug" to
  // isolate these from the clock-tick re-render noise. Remove once the
  // real cause here is confirmed (see share.js history / commit message).
  const canUseShareApi = typeof navigator !== 'undefined' && !!navigator.canShare && !!navigator.share;
  console.log('[report-debug] Web Share API present (navigator.canShare && navigator.share)?', canUseShareApi);

  if (canUseShareApi) {
    let file;
    let canShareFiles = false;
    try {
      file = new File([blob], filename, { type: mimeType });
      canShareFiles = navigator.canShare({ files: [file] });
    } catch (e) {
      console.error('[report-debug] File() or canShare() threw before a share attempt ->', e && e.name, '-', e && e.message, e);
    }
    console.log('[report-debug] navigator.canShare({ files: [file] }) ->', canShareFiles);

    if (canShareFiles) {
      try {
        await navigator.share({ files: [file], title: filename });
        console.log('[report-debug] navigator.share() resolved — share sheet flow completed');
        return 'shared';
      } catch (e) {
        console.error('[report-debug] navigator.share() rejected ->', e && e.name, '-', e && e.message, e);
        if (e && e.name === 'AbortError') {
          console.log('[report-debug] AbortError = user dismissed the sheet, NOT falling back to download');
          return 'dismissed';
        }
        console.log('[report-debug] non-Abort share failure, falling through to download');
      }
    } else {
      console.log('[report-debug] canShare(files) was false — falling through to download');
    }
  } else {
    console.log('[report-debug] no Web Share API on this browser/context, going straight to download');
  }

  console.log('[report-debug] calling downloadBlob()');
  downloadBlob(blob, filename);
  console.log('[report-debug] downloadBlob() returned with no exception');
  return 'downloaded';
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  console.log('[report-debug] downloadBlob: created object URL', url);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  console.log('[report-debug] downloadBlob: anchor appended to DOM, calling .click()');
  a.click();
  console.log('[report-debug] downloadBlob: .click() returned (this only proves the call didn\'t throw — a silent no-op download would still log this line)');
  document.body.removeChild(a);
  // Revoke shortly after, not immediately — revoking synchronously can
  // cancel the download in some browsers before it actually starts.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
