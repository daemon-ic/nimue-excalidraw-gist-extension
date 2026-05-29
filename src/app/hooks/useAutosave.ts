import { useCallback, useEffect, useRef, useState } from 'react';
import { MSG } from '@/lib/constants';
import { captureSceneHere } from '@/lib/excalidraw';
import { getSettings } from '@/lib/storage';
import type { DrawingMeta } from '@/types';

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return String(h);
}

export function useAutosave(
  enabled: boolean,
  owner: string | undefined,
  active: DrawingMeta | null | undefined,
  onUpdated: (d: DrawingMeta) => void
) {
  const [isSyncing, setIsSyncing] = useState(false);
  const lastHash = useRef<string | null>(null);
  const lastVersion = useRef<string | null>(null);

  const run = useCallback(async () => {
    if (!enabled || !owner || !active) return;

    try {
      setIsSyncing(true);
      const scene = await captureSceneHere();
      const content = JSON.stringify(scene, null, 2);
      const h = hash(content);

      if (h === lastHash.current) {
        setIsSyncing(false);
        return;
      }

      const res = await chrome.runtime.sendMessage({
        type: MSG.autosave,
        payload: { owner, drawing: active, content },
      });

      if (res?.ok) {
        lastHash.current = h;
        onUpdated(res.drawing);
        setIsSyncing(false);
      }
      // On failure, leave isSyncing true until the next successful save
    } catch {
      // Keep syncing indicator until success
    }
  }, [enabled, owner, active, onUpdated]);

  // Reset baseline when switching drawings
  useEffect(() => {
    lastHash.current = null;
    lastVersion.current = null;
    setIsSyncing(false);
  }, [active?.filename]);

  useEffect(() => {
    if (!enabled || !active) return;

    let intervalMs = 30_000;
    getSettings().then((s) => {
      intervalMs = s.autosaveIntervalMs;
    });

    const id = setInterval(() => {
      getSettings().then((s) => {
        if (s.autosave) run();
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [enabled, active, run]);

  useEffect(() => {
    if (!enabled || !active) return;

    const poll = setInterval(() => {
      const v = localStorage.getItem('version-dataState');
      if (v && v !== lastVersion.current) {
        lastVersion.current = v;
        getSettings().then((s) => {
          if (s.autosave) run();
        });
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [enabled, active, run]);

  return { isSyncing };
}
