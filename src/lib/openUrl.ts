import { MSG } from '@/lib/constants';

/** Open a URL in a new tab (popup + fallback when window.open is blocked). */
export function openInNewTab(url: string): void {
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (opened) return;

  chrome.runtime.sendMessage({ type: MSG.openUrl, url }, () => {
    if (chrome.runtime.lastError) {
      window.location.assign(url);
    }
  });
}
