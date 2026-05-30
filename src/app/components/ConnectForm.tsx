import { useState } from 'react';
import type { useAuth } from '@/app/hooks/useAuth';
import { NIMUE_PRIVACY_URL } from '@/lib/brand';

type Props = {
  auth: ReturnType<typeof useAuth>;
  /** When true, show token field even if already connected (update flow) */
  editing?: boolean;
  onDone?: () => void;
};

export function ConnectForm({ auth, editing = false, onDone }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    try {
      await auth.connect.mutateAsync(value.trim());
      setValue('');
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
    }
  }

  if (auth.isConnected && auth.user && editing) {
    return (
      <div className="nimue-connect">
        <p className="nimue-connect__label">
          Signed in as <strong>{auth.user.login}</strong>
        </p>
        <p className="nimue-connect__hint">
          Paste a new classic token with <strong>repo</strong> scope to replace the saved one.
        </p>
        <input
          type="password"
          className="nimue-input"
          placeholder="ghp_… new token"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        {error && <p className="nimue-error">{error}</p>}
        <div className="nimue-connect__row">
          <button
            type="button"
            className="nimue-btn nimue-btn--primary"
            disabled={!value.trim() || auth.connect.isPending}
            onClick={submit}
          >
            {auth.connect.isPending ? 'Saving…' : 'Update token'}
          </button>
          <button type="button" className="nimue-btn nimue-btn--ghost" onClick={onDone}>
            Cancel
          </button>
        </div>
        <button
          type="button"
          className="nimue-btn nimue-btn--ghost nimue-btn--danger"
          onClick={() => {
            auth.disconnect.mutate();
            onDone?.();
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="nimue-connect">
      <p className="nimue-connect__hint">
        Use a <strong>classic</strong> token at{' '}
        <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">
          github.com/settings/tokens
        </a>{' '}
        with the <strong>repo</strong> scope.
      </p>
      <input
        type="password"
        className="nimue-input"
        placeholder="ghp_…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {error && <p className="nimue-error">{error}</p>}
      <button
        type="button"
        className="nimue-btn nimue-btn--primary"
        disabled={!value.trim() || auth.connect.isPending}
        onClick={submit}
      >
        {auth.connect.isPending ? 'Connecting…' : 'Connect GitHub'}
      </button>
      <p className="nimue-connect__hint">
        <a href={NIMUE_PRIVACY_URL} target="_blank" rel="noreferrer">
          Privacy policy
        </a>
      </p>
    </div>
  );
}
