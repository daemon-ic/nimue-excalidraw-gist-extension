import type { ElementType } from 'react';
import { FiCopy, FiEdit3, FiExternalLink, FiPlus, FiSave } from 'react-icons/fi';
import type { DrawingMeta } from '@/types';

type Props = {
  active: DrawingMeta | null | undefined;
  busy: boolean;
  onNew: () => void;
  onSave: () => void;
  onRename: () => void;
  onCopy: () => void;
  onGitHub: () => void;
};

function Btn({
  label,
  icon: Icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: ElementType;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="nimue-tool" disabled={disabled} onClick={onClick} title={label}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

export function Toolbar({ active, busy, onNew, onSave, onRename, onCopy, onGitHub }: Props) {
  const needsActive = !active;
  return (
    <nav className="nimue-toolbar">
      <Btn label="New" icon={FiPlus} onClick={onNew} disabled={busy} />
      <Btn label="Save" icon={FiSave} onClick={onSave} disabled={busy || needsActive} />
      <Btn label="Rename" icon={FiEdit3} onClick={onRename} disabled={busy || needsActive} />
      <Btn label="Copy" icon={FiCopy} onClick={onCopy} disabled={busy || needsActive} />
      <Btn label="GitHub" icon={FiExternalLink} onClick={onGitHub} disabled={needsActive} />
    </nav>
  );
}
