import type { ReactNode } from 'react';

type IconTooltipButtonProps = {
  label: string;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
  children: ReactNode;
};

export function IconTooltipButton({
  label,
  tooltip,
  onClick,
  active,
  className,
  children,
}: IconTooltipButtonProps) {
  return (
    <button
      type="button"
      className={[
        'nimue-icon-btn',
        'nimue-has-tooltip',
        active ? 'nimue-icon-btn--active' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label={label}
      data-tooltip={tooltip}
    >
      {children}
    </button>
  );
}
