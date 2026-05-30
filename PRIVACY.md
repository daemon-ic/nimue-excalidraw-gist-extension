# Privacy Policy

**Nimue — Github Storage for Excalidraw** · Last updated: May 30, 2026

Hosted copy (for Chrome Web Store):  
**https://daemon-ic.github.io/nimue-excalidraw-gist-extension/privacy.html**

Nimue is a Chrome extension that syncs your Excalidraw drawings to a private GitHub repository. This policy describes what data the extension handles and where it goes.

## Summary

- We do not operate any servers and do not collect analytics.
- Your GitHub token and preferences stay in your browser.
- Drawing files are stored in **your** private GitHub repository.
- Network requests go only to `api.github.com` and `excalidraw.com`.

## Data stored on your device

Nimue uses Chrome’s local extension storage (`chrome.storage.local`) to keep:

- **GitHub personal access token** — you paste this when connecting. It is used only to authenticate requests to GitHub’s API.
- **Active drawing metadata** — filename, display name, and file version (`sha`) for the drawing currently loaded in Excalidraw.
- **Settings** — autosave on/off and autosave interval.

This data is not sent to the extension developer or any third party. It remains on your device until you disconnect, clear extension data, or uninstall the extension.

## Data stored on GitHub

When you save or autosave, Nimue writes `.excalidraw` JSON files to a private repository named `nimue-excalidraw-storage` in your GitHub account. You own and control that repository.

To validate your token, Nimue calls GitHub’s `/user` endpoint and reads your public username (and optionally your display name) to show “Signed in as …” in the UI.

## Where data is sent

Nimue only contacts **excalidraw.com** (in-page panel and canvas storage) and **api.github.com** (sync drawings with your private repository). No other websites or services are used.

## What we do not collect

- No usage analytics or crash reporting
- No advertising or tracking pixels
- No accounts on developer-operated servers
- No sale or sharing of personal data

## How to revoke access

1. In Nimue, open the account panel and click **Disconnect**.
2. On GitHub, go to [Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) and delete or revoke the token you created for Nimue.
3. Optionally remove the extension in `chrome://extensions` and clear its stored data.

## Uninstalling

Uninstalling Nimue removes the extension but may leave data in Chrome’s extension storage until you clear it manually. Your drawings remain in your GitHub repository until you delete them there.

## Contact

Questions or concerns: [open an issue on GitHub](https://github.com/daemon-ic/nimue-excalidraw-gist-extension/issues).
