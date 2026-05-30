# Nimue — Github Storage for Excalidraw

Chrome extension that syncs [Excalidraw](https://excalidraw.com) drawings to a private GitHub repo (`nimue-excalidraw-storage`), with autosave and an in-page file panel.

## Features

- Connect with a GitHub personal access token (`repo` scope)
- Create, save, load, rename, and copy drawings
- Autosave to GitHub while you draw (in-page panel)
- Embedded images via Excalidraw’s IndexedDB
- In-page panel on excalidraw.com + toolbar popup

## Project layout

```
src/
  app/           # React UI (shared by popup + content script)
  background/    # Autosave service worker
  content/       # In-page panel entry
  popup/         # Toolbar popup entry
  lib/           # GitHub API, storage, Excalidraw page bridge
  types/         # Shared TypeScript types
```

## Develop

```bash
pnpm install
pnpm dev      # watch build → load dist/ in chrome://extensions
pnpm build    # production build
```

Load the **`dist`** folder as an unpacked extension.

## Usage

1. Open https://excalidraw.com
2. Click **Nimue** in the top-right toolbar (below Excalidraw+, Share, and Library)
3. Connect GitHub (classic token with `repo` scope)
4. **New** → create a drawing; select one from the list to load
5. Edit the canvas — **Autosave** pushes changes to GitHub when a drawing is active

## Permissions & privacy

- [PERMISSIONS.txt](./PERMISSIONS.txt) — Chrome Web Store permission justifications (plain text)
- [PRIVACY.md](./PRIVACY.md) — privacy policy (hosted at [daemon-ic.github.io/.../privacy.html](https://daemon-ic.github.io/nimue-excalidraw-gist-extension/privacy.html))

## License

MIT
