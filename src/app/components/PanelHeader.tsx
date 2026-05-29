import { FiFileText, FiGithub, FiHeart, FiRefreshCw, FiSettings } from 'react-icons/fi';
import { IconTooltipButton } from '@/app/components/IconTooltipButton';
import { NIMUE_SUPPORT_URL } from '@/lib/brand';
import type { DrawingMeta } from '@/types';

type PanelHeaderProps = {
  connected: boolean;
  showAccountPanel: boolean;
  username?: string;
  activeDrawing: DrawingMeta | null | undefined;
  onConnect: () => void;
  onToggleAccount: () => void;
  onRefresh: () => void;
};

export function PanelHeader({
  connected,
  showAccountPanel,
  username,
  activeDrawing,
  onConnect,
  onToggleAccount,
  onRefresh,
}: PanelHeaderProps) {
  const openSupport = () => {
    if (!NIMUE_SUPPORT_URL) return;
    chrome.tabs.create({ url: NIMUE_SUPPORT_URL });
  };

  const supportTooltip = NIMUE_SUPPORT_URL
    ? 'Support Nimue'
    : 'Support Nimue (coming soon)';

  const actions = (
    <div className="nimue-header__actions">
      {!connected ? (
        <IconTooltipButton
          label="Connect GitHub"
          tooltip="Connect your GitHub account"
          onClick={onConnect}
          className="nimue-icon-btn--primary"
        >
          Connect
        </IconTooltipButton>
      ) : (
        <>
          <IconTooltipButton
            label="Account settings"
            tooltip="GitHub account & token"
            onClick={onToggleAccount}
            active={showAccountPanel}
          >
            <FiSettings size={16} />
          </IconTooltipButton>
          <IconTooltipButton
            label="Refresh drawings"
            tooltip="Refresh drawing list"
            onClick={onRefresh}
          >
            <FiRefreshCw size={16} />
          </IconTooltipButton>
        </>
      )}
      <IconTooltipButton
        label="Support Nimue"
        tooltip={supportTooltip}
        onClick={openSupport}
        className="nimue-icon-btn--heart"
      >
        <FiHeart size={16} />
      </IconTooltipButton>
    </div>
  );

  if (!connected) {
    return (
      <header className="nimue-header nimue-header--disconnected">
        <p className="nimue-header__hint">Connect GitHub to save drawings</p>
        {actions}
      </header>
    );
  }

  return (
    <header className="nimue-header">
      <div className="nimue-header__doc">
        <div className="nimue-header__name-row">
          <FiFileText className="nimue-header__file-icon" aria-hidden />
          {activeDrawing ? (
            <span className="nimue-header__name" title={activeDrawing.filename}>
              {activeDrawing.name}
            </span>
          ) : (
            <span className="nimue-header__name nimue-header__name--empty">No drawing selected</span>
          )}
        </div>
        {username && (
          <a
            className="nimue-header__account"
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            title={`GitHub: @${username}`}
          >
            <FiGithub size={12} aria-hidden />
            <span>@{username}</span>
          </a>
        )}
      </div>
      {actions}
    </header>
  );
}
