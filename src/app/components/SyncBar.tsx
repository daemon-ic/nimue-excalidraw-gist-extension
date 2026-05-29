type SyncBarProps = {
  syncing: boolean;
  autosaveEnabled: boolean;
  onAutosaveToggle: () => void;
};

export function SyncBar({ syncing, autosaveEnabled, onAutosaveToggle }: SyncBarProps) {
  return (
    <div className="nimue-sync-bar">
      <div className={`nimue-sync ${syncing ? 'nimue-sync--syncing' : 'nimue-sync--synced'}`}>
        <span className="nimue-sync__dot" aria-hidden />
        <span className="nimue-sync__label">{syncing ? 'Syncing...' : 'Synced'}</span>
      </div>
      <label className="nimue-autosave-toggle">
        <input type="checkbox" checked={autosaveEnabled} onChange={onAutosaveToggle} />
        Autosave
      </label>
    </div>
  );
}
