import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY } from '@/lib/constants';
import {
  createDrawing,
  listDrawings,
  readDrawing,
  renameDrawing,
  updateDrawing,
} from '@/lib/github';
import {
  applyScene,
  applySceneHere,
  captureScene,
  captureSceneHere,
  emptyScene,
  getExcalidrawTabId,
} from '@/lib/excalidraw';
import { getActiveDrawing, setActiveDrawing } from '@/lib/storage';
import type { DrawingMeta } from '@/types';

export function useDrawings(owner: string | undefined, inPage: boolean) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: QUERY.drawings,
    queryFn: () => listDrawings(owner!),
    enabled: !!owner,
  });

  const active = useQuery({
    queryKey: QUERY.active,
    queryFn: getActiveDrawing,
  });

  const capture = () => (inPage ? captureSceneHere() : getExcalidrawTabId().then(captureScene));

  /** Save current canvas to GitHub before switching drawings */
  async function saveCurrentIfNeeded(): Promise<void> {
    if (!owner) return;
    const current = await getActiveDrawing();
    if (!current) return;
    try {
      const scene = await capture();
      const updated = await updateDrawing(owner, current, scene);
      await setActiveDrawing(updated);
      qc.setQueryData(QUERY.active, updated);
    } catch {
      // Empty or unreadable canvas — skip
    }
  }

  const load = useMutation({
    mutationFn: async (drawing: DrawingMeta) => {
      await saveCurrentIfNeeded();
      const scene = await readDrawing(owner!, drawing.filename);
      const meta = { ...drawing };
      await setActiveDrawing(meta);
      if (inPage) {
        await applySceneHere(scene, meta);
      } else {
        await applyScene(await getExcalidrawTabId(), scene, meta);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY.active });
      qc.invalidateQueries({ queryKey: QUERY.drawings });
    },
  });

  const save = useMutation({
    mutationFn: async (drawing: DrawingMeta) => {
      const scene = await capture();
      const updated = await updateDrawing(owner!, drawing, scene);
      await setActiveDrawing(updated);
      return updated;
    },
    onSuccess: (d) => {
      qc.setQueryData(QUERY.active, d);
      qc.invalidateQueries({ queryKey: QUERY.drawings });
    },
  });

  const create = useMutation({
    mutationFn: async (name: string) => {
      await saveCurrentIfNeeded();
      const scene = emptyScene();
      const meta = await createDrawing(owner!, name, scene);
      await setActiveDrawing(meta);
      if (inPage) {
        await applySceneHere(scene, meta);
      } else {
        await applyScene(await getExcalidrawTabId(), scene, meta);
      }
      return meta;
    },
    onSuccess: (meta) => {
      qc.setQueryData(QUERY.active, meta);
      qc.invalidateQueries({ queryKey: QUERY.drawings });
    },
  });

  const copy = useMutation({
    mutationFn: async ({ name }: { source: DrawingMeta; name: string }) => {
      const scene = await capture();
      return createDrawing(owner!, name, scene);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY.drawings }),
  });

  const rename = useMutation({
    mutationFn: async ({ drawing, name }: { drawing: DrawingMeta; name: string }) => {
      const scene = await capture();
      const meta = await renameDrawing(owner!, drawing, name, scene);
      await setActiveDrawing(meta);
      return meta;
    },
    onSuccess: (meta) => {
      qc.setQueryData(QUERY.active, meta);
      qc.invalidateQueries({ queryKey: QUERY.drawings });
    },
  });

  const setActive = useMutation({
    mutationFn: setActiveDrawing,
    onSuccess: (d) => qc.setQueryData(QUERY.active, d),
  });

  return { list, active, load, save, create, copy, rename, setActive };
}
