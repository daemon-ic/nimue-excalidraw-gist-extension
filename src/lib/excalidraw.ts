import type { DrawingMeta, ExcalidrawScene } from '@/types';

const FILES_DB = 'files-db';
const FILES_STORE = 'files-store';
const DRAWING_ID_KEY = 'drawing-id';
const DRAWING_TITLE_KEY = 'drawing-title';

export function emptyScene(): ExcalidrawScene {
  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements: [],
    appState: {
      showWelcomeScreen: false,
      theme: 'light',
      viewBackgroundColor: '#ffffff',
      currentItemStrokeColor: '#1e1e1e',
      currentItemBackgroundColor: 'transparent',
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0,
    },
    files: {},
  };
}

/** Find excalidraw.com tab (not the extension popup) */
export async function getExcalidrawTabId(): Promise<number> {
  const tabs = await chrome.tabs.query({ url: 'https://excalidraw.com/*' });
  if (tabs.length === 0) {
    throw new Error('Open https://excalidraw.com first');
  }
  const focused = tabs.find((t) => t.active);
  const tab = focused ?? tabs[0];
  if (!tab?.id) throw new Error('No Excalidraw tab');
  return tab.id;
}

async function writeFilesToIndexedDB(files: ExcalidrawScene['files']): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(FILES_DB);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE);
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        resolve();
        return;
      }
      const tx = db.transaction(FILES_STORE, 'readwrite');
      const store = tx.objectStore(FILES_STORE);
      store.clear();
      if (files && Object.keys(files).length > 0) {
        for (const file of Object.values(files)) {
          store.put({ ...file, lastRetrieved: Date.now() });
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
  });
}

/** Runs in page / content-script context — must write before reload */
function persistSceneToPage(scene: ExcalidrawScene, filename: string, title: string): void {
  localStorage.setItem('excalidraw', JSON.stringify(scene.elements));
  localStorage.setItem('excalidraw-state', JSON.stringify(scene.appState ?? {}));

  const vf = Number(localStorage.getItem('version-files')) || 0;
  const vd = Number(localStorage.getItem('version-dataState')) || 0;
  localStorage.setItem('version-files', String(vf + 1));
  localStorage.setItem('version-dataState', String(vd + 1));
  localStorage.setItem(DRAWING_ID_KEY, filename);
  localStorage.setItem(DRAWING_TITLE_KEY, title);
}

async function applySceneInPage(
  scene: ExcalidrawScene,
  filename: string,
  title: string
): Promise<void> {
  await writeFilesToIndexedDB(scene.files ?? {});
  persistSceneToPage(scene, filename, title);
  window.location.reload();
}

async function captureSceneInPage(): Promise<ExcalidrawScene> {
  const elementsRaw = localStorage.getItem('excalidraw');
  const stateRaw = localStorage.getItem('excalidraw-state');
  if (!elementsRaw || !stateRaw) throw new Error('No canvas data');

  const files: ExcalidrawScene['files'] = {};

  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.open(FILES_DB);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        resolve();
        return;
      }
      const tx = db.transaction(FILES_STORE, 'readonly');
      const all = tx.objectStore(FILES_STORE).getAll();
      all.onsuccess = () => {
        for (const f of all.result as Array<{ id: string }>) {
          if (f?.id) files[f.id] = f as ExcalidrawScene['files'][string];
        }
        resolve();
      };
      all.onerror = () => reject(all.error);
    };
  });

  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements: JSON.parse(elementsRaw),
    appState: JSON.parse(stateRaw),
    files,
  };
}

export async function captureScene(tabId: number): Promise<ExcalidrawScene> {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: captureSceneInPage,
  });
  if (!result?.result) throw new Error('Could not read canvas');
  return result.result;
}

export async function applyScene(
  tabId: number,
  scene: ExcalidrawScene,
  meta: DrawingMeta
): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: applySceneInPage,
    args: [scene, meta.filename, meta.name],
  });
}

export async function captureSceneHere(): Promise<ExcalidrawScene> {
  return captureSceneInPage();
}

export async function applySceneHere(scene: ExcalidrawScene, meta: DrawingMeta): Promise<void> {
  return applySceneInPage(scene, meta.filename, meta.name);
}
