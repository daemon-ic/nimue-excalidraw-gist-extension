import type { DrawingMeta } from '@/types';

type Props = {
  drawings: DrawingMeta[];
  activeFilename?: string;
  loadingFilename?: string;
  onSelect: (d: DrawingMeta) => void;
};

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return m <= 1 ? 'just now' : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function DrawingList({ drawings, activeFilename, loadingFilename, onSelect }: Props) {
  if (drawings.length === 0) {
    return (
      <p className="nimue-empty">No drawings yet. Create one with <strong>New</strong>.</p>
    );
  }

  return (
    <ul className="nimue-list">
      {drawings.map((d) => {
        const selected = d.filename === activeFilename;
        const loading = d.filename === loadingFilename;
        return (
          <li key={d.filename}>
            <button
              type="button"
              className={`nimue-list__item${selected ? ' nimue-list__item--active' : ''}`}
              disabled={loading}
              onClick={() => onSelect(d)}
            >
              <span className="nimue-list__name">{d.name}</span>
              <span className="nimue-list__meta">{timeAgo(d.lastUpdated)}</span>
              {loading && <span className="nimue-list__spinner" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
