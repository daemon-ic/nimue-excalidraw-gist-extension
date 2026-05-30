import { NIMUE_LOGO_URL, NIMUE_PRIVACY_URL } from '@/lib/brand';
import { EXCALIDRAW_ORIGIN } from '@/lib/constants';
import { openInNewTab } from '@/lib/openUrl';

export function PopupInfo() {
  return (
    <div className="nimue-popup-info">
      <header className="nimue-popup-info__header">
        <img src={NIMUE_LOGO_URL} alt="" className="nimue-popup-info__logo" width={24} height={24} />
        <div>
          <h1 className="nimue-popup-info__title">Nimue</h1>
          <p className="nimue-popup-info__tagline">Github Storage for Excalidraw</p>
        </div>
      </header>

      <p className="nimue-popup-info__text">
        Sync drawings to your private GitHub repo. On excalidraw.com, open the{' '}
        <strong>Nimue</strong> button under the top-right toolbar.
      </p>

      <p className="nimue-popup-info__nav">
        <button type="button" className="nimue-popup-info__link" onClick={() => openInNewTab(EXCALIDRAW_ORIGIN)}>
          Open Excalidraw
        </button>
      </p>

      <footer className="nimue-popup-info__footer">
        <a href={NIMUE_PRIVACY_URL} target="_blank" rel="noreferrer">
          Privacy
        </a>
      </footer>
    </div>
  );
}
