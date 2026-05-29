type Props = {
  title: string;
  initial?: string;
  loading?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (name: string) => void | Promise<void>;
};

export function NamePrompt({
  title,
  initial = '',
  loading = false,
  error = null,
  onCancel,
  onSubmit,
}: Props) {
  return (
    <div className="nimue-overlay" role="dialog">
      <form
        className="nimue-dialog"
        onSubmit={async (e) => {
          e.preventDefault();
          const name = new FormData(e.currentTarget).get('name') as string;
          if (name.trim()) await onSubmit(name.trim());
        }}
      >
        <h3>{title}</h3>
        <input
          name="name"
          className="nimue-input"
          defaultValue={initial}
          autoFocus
          required
          disabled={loading}
        />
        {error && (
          <p className="nimue-error nimue-error--block">
            {error.split('\n').map((line, i) =>
              line.startsWith('http') ? (
                <a key={i} href={line} target="_blank" rel="noreferrer" className="nimue-error__link">
                  Create repository on GitHub
                </a>
              ) : (
                <span key={i}>
                  {line}
                  <br />
                </span>
              )
            )}
          </p>
        )}
        <div className="nimue-dialog__actions">
          <button type="button" className="nimue-btn nimue-btn--ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="nimue-btn nimue-btn--primary" disabled={loading}>
            {loading ? 'Working…' : 'OK'}
          </button>
        </div>
      </form>
    </div>
  );
}
