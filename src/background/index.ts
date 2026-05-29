import { MSG } from '@/lib/constants';
import { updateDrawing } from '@/lib/github';
import { setActiveDrawing } from '@/lib/storage';
import type { AutosavePayload } from '@/types';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== MSG.autosave) return false;

  const { owner, drawing, content } = message.payload as AutosavePayload;
  const scene = JSON.parse(content);

  updateDrawing(owner, drawing, scene)
    .then(async (updated) => {
      await setActiveDrawing(updated);
      sendResponse({ ok: true, drawing: updated });
    })
    .catch((err: Error) => sendResponse({ ok: false, error: err.message }));

  return true;
});
