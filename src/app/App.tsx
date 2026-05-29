import { useEffect, useState } from 'react';
import { notifyExcalidrawResize, setNimueAnchor } from '@/content/layout';
import { useAuth } from '@/app/hooks/useAuth';
import { useDrawings } from '@/app/hooks/useDrawings';
import { useAutosave } from '@/app/hooks/useAutosave';
import { ConnectForm } from '@/app/components/ConnectForm';
import { DrawingList } from '@/app/components/DrawingList';
import { Toolbar } from '@/app/components/Toolbar';
import { NamePrompt } from '@/app/components/NamePrompt';
import { SyncBar } from '@/app/components/SyncBar';
import { PanelHeader } from '@/app/components/PanelHeader';
import { NIMUE_LOGO_URL } from '@/lib/brand';
import { getSettings, setSettings } from '@/lib/storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY } from '@/lib/constants';
import type { DrawingMeta } from '@/types';

type Prompt = { kind: 'new' | 'rename' | 'copy'; initial?: string };

type AppProps = {
  variant: 'panel' | 'popup';
};

export function App({ variant }: AppProps) {
  const inPage = variant === 'panel';
  const [open, setOpen] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const qc = useQueryClient();

  const auth = useAuth();
  const owner = auth.user?.login;
  const drawings = useDrawings(owner, inPage);
  const active = drawings.active.data;

  const settingsQuery = useQuery({ queryKey: QUERY.settings, queryFn: getSettings });

  const autosaveEnabled = inPage && (settingsQuery.data?.autosave ?? true);

  const autosave = useAutosave(
    autosaveEnabled,
    owner,
    active,
    (d) => qc.setQueryData(QUERY.active, d)
  );

  const busy =
    drawings.load.isPending ||
    drawings.save.isPending ||
    drawings.create.isPending ||
    drawings.copy.isPending ||
    drawings.rename.isPending;

  const isSyncing = busy || autosave.isSyncing;

  async function selectDrawing(d: DrawingMeta) {
    if (active?.filename === d.filename) {
      drawings.setActive.mutate(null);
      return;
    }
    setLoadingFile(d.filename);
    try {
      await drawings.load.mutateAsync(d);
    } finally {
      setLoadingFile(null);
    }
  }

  async function toggleAutosave() {
    const s = await getSettings();
    const next = { ...s, autosave: !s.autosave };
    await setSettings(next);
    qc.setQueryData(QUERY.settings, next);
  }

  useEffect(() => {
    if (!inPage) return;
    setNimueAnchor(true);
    return () => setNimueAnchor(false);
  }, [inPage]);

  useEffect(() => {
    if (!inPage) return;
    notifyExcalidrawResize();
  }, [inPage, open]);

  useEffect(() => {
    if (!inPage || !open) return;

    const onPointerDown = (e: PointerEvent) => {
      const host = document.getElementById('nimue-host');
      if (host?.contains(e.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [inPage, open]);

  const panelBody = (
    <>
      <PanelHeader
        connected={auth.isConnected}
        showAccountPanel={showConnect}
        username={auth.user?.login}
        activeDrawing={active}
        onConnect={() => setShowConnect(true)}
        onToggleAccount={() => setShowConnect((v) => !v)}
        onRefresh={() => drawings.list.refetch()}
      />

      {(showConnect || !auth.isConnected) && (
        <section className="nimue-section nimue-section--account">
          <ConnectForm
            auth={auth}
            editing={auth.isConnected && showConnect}
            onDone={() => setShowConnect(false)}
          />
        </section>
      )}

      {auth.isConnected && (
        <>
          {inPage && (
            <SyncBar
              syncing={isSyncing}
              autosaveEnabled={autosaveEnabled}
              onAutosaveToggle={toggleAutosave}
            />
          )}

          <Toolbar
            active={active}
            busy={busy}
            onNew={() => {
              setPromptError(null);
              setPrompt({ kind: 'new' });
            }}
            onSave={() => active && drawings.save.mutate(active)}
            onRename={() => active && setPrompt({ kind: 'rename', initial: active.name })}
            onCopy={() => active && setPrompt({ kind: 'copy', initial: `${active.name} (copy)` })}
            onGitHub={() => active && window.open(active.htmlUrl, '_blank')}
          />

          <section className="nimue-section nimue-section--list">
            {drawings.list.isLoading ? (
              <p className="nimue-empty">Loading…</p>
            ) : (
              <DrawingList
                drawings={drawings.list.data ?? []}
                activeFilename={active?.filename}
                loadingFilename={loadingFile ?? undefined}
                onSelect={selectDrawing}
              />
            )}
          </section>
        </>
      )}

      {prompt?.kind === 'new' && (
        <NamePrompt
          title="New drawing"
          loading={drawings.create.isPending}
          error={promptError}
          onCancel={() => {
            if (!drawings.create.isPending) {
              setPrompt(null);
              setPromptError(null);
            }
          }}
          onSubmit={async (name) => {
            setPromptError(null);
            try {
              await drawings.create.mutateAsync(name);
              setPrompt(null);
            } catch (e) {
              setPromptError(e instanceof Error ? e.message : 'Failed to create drawing');
            }
          }}
        />
      )}
      {prompt?.kind === 'rename' && active && (
        <NamePrompt
          title="Rename drawing"
          initial={prompt.initial ?? active.name}
          onCancel={() => setPrompt(null)}
          onSubmit={(name) => {
            drawings.rename.mutate({ drawing: active, name });
            setPrompt(null);
          }}
        />
      )}
      {prompt?.kind === 'copy' && active && (
        <NamePrompt
          title="Copy drawing"
          initial={prompt.initial}
          onCancel={() => setPrompt(null)}
          onSubmit={(name) => {
            drawings.copy.mutate({ source: active, name });
            setPrompt(null);
          }}
        />
      )}
    </>
  );

  if (inPage) {
    return (
      <div className="nimue-root">
        <button
          type="button"
          className={`nimue-trigger nimue-has-tooltip${open ? ' nimue-trigger--active' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Nimue"
          aria-expanded={open}
          data-tooltip={open ? 'Close Nimue' : 'Open Nimue'}
        >
          <img src={NIMUE_LOGO_URL} alt="" className="nimue-trigger__logo" width={16} height={16} />
          <span className="nimue-trigger__label">Nimue</span>
        </button>
        {open && <div className="nimue-shell nimue-shell--dropdown">{panelBody}</div>}
      </div>
    );
  }

  return <div className="nimue-shell nimue-shell--popup">{panelBody}</div>;
}
