const TOP_RIGHT_UI_SELECTOR = '.excalidraw-ui-top-right';
const SIDEBAR_TRIGGER_SELECTOR = '.sidebar-trigger';
const ANCHOR_GAP_PX = 6;

let stopAnchor: (() => void) | null = null;

function getTopRightButtonsRect(): DOMRect | null {
  const elements = [
    document.querySelector(TOP_RIGHT_UI_SELECTOR),
    document.querySelector(SIDEBAR_TRIGGER_SELECTOR),
  ].filter((el): el is Element => !!el);

  if (!elements.length) return null;

  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;

  for (const el of elements) {
    const r = el.getBoundingClientRect();
    top = Math.min(top, r.top);
    bottom = Math.max(bottom, r.bottom);
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
  }

  return new DOMRect(left, top, right - left, bottom - top);
}

function updateAnchor(): void {
  const rect = getTopRightButtonsRect();
  if (!rect) return;

  const root = document.documentElement;
  root.style.setProperty('--nimue-anchor-top', `${rect.bottom + ANCHOR_GAP_PX}px`);
  root.style.setProperty('--nimue-anchor-right', `${window.innerWidth - rect.right}px`);
}

function removeAnchorVars(): void {
  const root = document.documentElement;
  root.style.removeProperty('--nimue-anchor-top');
  root.style.removeProperty('--nimue-anchor-right');
}

/** Pin Nimue below the top-right toolbar row (Excalidraw+, Share, library). */
export function setNimueAnchor(active: boolean): void {
  stopAnchor?.();
  stopAnchor = null;
  removeAnchorVars();
  if (!active) return;

  const onLayout = () => updateAnchor();
  onLayout();

  const ro = new ResizeObserver(onLayout);
  ro.observe(document.documentElement);

  window.addEventListener('resize', onLayout, { passive: true });

  const mo = new MutationObserver(onLayout);
  mo.observe(document.body, { childList: true, subtree: true, attributes: true });

  stopAnchor = () => {
    ro.disconnect();
    mo.disconnect();
    window.removeEventListener('resize', onLayout);
    stopAnchor = null;
    removeAnchorVars();
  };
}

/** Notify Excalidraw to relayout the canvas (e.g. when panel opens). */
export function notifyExcalidrawResize(): void {
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
}

export function clearNimueLayoutMode(): void {
  setNimueAnchor(false);
  notifyExcalidrawResize();
}
