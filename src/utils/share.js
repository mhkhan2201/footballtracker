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

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.share) {
    try {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return 'shared';
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return 'dismissed';
      // fall through to download for any other failure
    }
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}

function downloadBlob(blob, filename) {
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
