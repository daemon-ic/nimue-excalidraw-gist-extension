import { MSG } from '@/lib/constants';
import { updateDrawing } from '@/lib/github';
import { setActiveDrawing } from '@/lib/storage';
import type { AutosavePayload, ExcalidrawScene } from '@/types';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MSG.openUrl && typeof message.url === 'string') {
    void chrome.tabs
      .create({ url: message.url })
      .then(() => sendResponse({ ok: true }))
      .catch((err: Error) => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (message?.type !== MSG.autosave) return false;

  const { owner, drawing, content } = message.payload as AutosavePayload;

  let scene: ExcalidrawScene;
  try {
    scene = JSON.parse(content) as ExcalidrawScene;
  } catch {
    sendResponse({ ok: false, error: 'Invalid drawing data' });
    return true;
  }

  updateDrawing(owner, drawing, scene)
    .then(async (updated) => {
      await setActiveDrawing(updated);
      sendResponse({ ok: true, drawing: updated });
    })
    .catch((err: Error) => sendResponse({ ok: false, error: err.message }));

  return true;
});
