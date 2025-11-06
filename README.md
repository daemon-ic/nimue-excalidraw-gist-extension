# Nimue - Excalidraw Companion

A Chrome extension that seamlessly manages your Excalidraw drawings by syncing them with GitHub Gists, enabling version control and cross-device access to your diagrams.

## Features

- **GitHub Integration** – Connect your GitHub account to store drawings as Gists
- **Drawing Gallery** – Browse all your Excalidraw drawings in a visual gallery view
- **One-Click Loading** – Load any saved drawing into Excalidraw with a single click
- **Auto-Save** – Save your current drawing to GitHub at any time
- **Drawing Management**:
  - Create new empty drawings
  - Rename existing drawings
  - Duplicate/copy drawings
  - View drawings on GitHub
- **Real-time Sync** – Works directly with Excalidraw's localStorage to ensure drawings are properly loaded and saved
- **Excalidraw.com Only** – Specifically designed to work on https://excalidraw.com

## Demo

![Extension popup showing drawing gallery](docs/screenshot-popup.png)
![Connect to GitHub modal](docs/screenshot-connect.png)

## Installation

### Option 1: Install from Chrome Web Store

_Coming soon_ – The extension will be available on the Chrome Web Store.

### Option 2: Install from Source (Developer Mode)

1. **Clone this repository**:
   ```bash
   git clone https://github.com/yourusername/nimue.git
   cd nimue/vite
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Build the extension**:
   ```bash
   pnpm run build
   # or
   npm run build
   ```
   
   This compiles TypeScript and bundles the extension into the `dist/` directory.

4. **Load into Chrome**:
   - Open `chrome://extensions` in your browser
   - Enable **Developer Mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `dist/` directory from this project

### Development Mode

For active development with hot-reloading:

```bash
pnpm run dev:extension
# or
npm run dev:extension
```

This watches for file changes and automatically rebuilds the extension. You'll need to manually reload the extension in `chrome://extensions` after changes.

## Usage

### First-Time Setup

1. **Install the extension** (see Installation section above)

2. **Navigate to Excalidraw**:
   - Open https://excalidraw.com in Chrome

3. **Open the extension**:
   - Click the Nimue icon in your Chrome toolbar
   - If you don't see it, click the puzzle icon and pin Nimue

4. **Connect to GitHub**:
   - Click "Connect" in the extension popup
   - Enter your GitHub Personal Access Token
   - To create a token:
     - Go to https://github.com/settings/tokens
     - Click "Generate new token (classic)"
     - Give it a name (e.g., "Nimue Extension")
     - Select the `gist` scope (required to create and manage gists)
     - Click "Generate token"
     - Copy and paste the token into Nimue

### Working with Drawings

#### Create a New Drawing
1. Open the Nimue extension while on excalidraw.com
2. Click the **+** (Plus) button in the sidebar
3. Enter a name for your drawing
4. A new empty drawing will be created as a GitHub Gist

#### Save Your Current Drawing
1. Make changes to your drawing in Excalidraw
2. Open the Nimue extension
3. Select the drawing you want to update (it will be highlighted)
4. Click the **Save** button in the sidebar
5. Your changes will be pushed to GitHub

#### Load an Existing Drawing
1. Open the Nimue extension
2. Browse your drawings in the gallery
3. Click on any drawing thumbnail
4. The page will reload with your selected drawing

#### Rename a Drawing
1. Select a drawing from the gallery
2. Click the **Rename** button (pencil icon)
3. Enter the new name
4. The drawing will be updated on GitHub

#### Copy/Duplicate a Drawing
1. Select a drawing from the gallery
2. Click the **Copy** button
3. Enter a name for the copy
4. A new Gist will be created with the current drawing content

#### View on GitHub
1. Select a drawing from the gallery
2. Click the **View on GitHub** button (external link icon)
3. The Gist will open in a new tab

## Configuration

### GitHub Token

The extension stores your GitHub Personal Access Token in Chrome's local storage. The token is:
- Stored securely in the browser's extension storage
- Never transmitted anywhere except to GitHub's official API (api.github.com)
- Required to have the `gist` scope

To update or change your token:
1. Disconnect from the current account (if connected)
2. Click "Connect" and enter a new token

### Storage Location

All drawings are stored as GitHub Gists with:
- Filename: `drawing.excalidraw`
- Public visibility (configurable in code)
- Full Excalidraw JSON format including elements, appState, and files

## Permissions

The extension requests the following Chrome permissions:

- **`activeTab`** – To detect when you're on excalidraw.com
- **`tabs`** – To query the current active tab
- **`storage`** – To securely store your GitHub token locally
- **`scripting`** – To inject scripts that read/write Excalidraw's localStorage
- **`host_permissions: excalidraw.com`** – To interact specifically with Excalidraw

All permissions are used exclusively for the extension's core functionality and no data is collected or sent to third parties.

## Development

### Project Structure

```
vite/
├── src/
│   ├── components/          # React UI components
│   │   ├── Gallery.tsx      # Drawing gallery view
│   │   ├── Sidebar.tsx      # Action buttons sidebar
│   │   ├── Header.tsx       # Extension header
│   │   └── ...
│   ├── hooks/               # React hooks
│   │   ├── useGist.ts       # GitHub Gist API hooks
│   │   ├── useGithub.ts     # GitHub auth hooks
│   │   └── useStorage.ts    # Chrome storage hooks
│   ├── services/
│   │   ├── background/      # Background script utilities
│   │   └── extension/       # Extension-specific services
│   │       ├── extract.ts   # Extract Excalidraw data
│   │       └── chrome.ts    # Chrome API wrappers
│   ├── pages/
│   │   └── Popup.tsx        # Main popup page
│   ├── types/               # TypeScript type definitions
│   ├── styles/              # CSS and Tailwind styles
│   ├── manifest.json        # Chrome extension manifest
│   ├── popup.html           # Popup HTML entry
│   └── background.ts        # Background service worker
├── build-extension.js       # Build script
├── watch-extension.js       # Development watch script
├── vite.config.ts           # Vite configuration
└── package.json
```

### Available Scripts

```bash
# Development mode with hot reload
pnpm run dev:extension

# Production build
pnpm run build

# Type checking
pnpm run type-check

# Clean build artifacts and dependencies
pnpm run clean
```

### Tech Stack

- **React 18** – UI framework
- **TypeScript** – Type safety
- **Vite** – Fast build tool and dev server
- **Tailwind CSS** – Utility-first styling
- **React Query (TanStack Query)** – Server state management
- **webextension-polyfill** – Cross-browser compatibility
- **React Icons** – Icon library

### Adding New Features

1. **Create a new component** in `src/components/`
2. **Add types** in `src/types/` if needed
3. **Create hooks** for data fetching in `src/hooks/`
4. **Use React Query** for API calls to maintain cache consistency
5. **Test locally** using `pnpm run dev:extension`

## Testing

The extension should be tested on:
- Chrome (primary target)
- Chromium-based browsers (Edge, Brave, etc.)

Manual testing workflow:
1. Load the extension in developer mode
2. Navigate to https://excalidraw.com
3. Create/modify a drawing in Excalidraw
4. Open the extension popup
5. Test each feature (save, load, create, rename, copy)
6. Verify data persists on GitHub Gists
7. Test loading drawings in a new browser/device

## Roadmap

### Current Limitations
- Only works on excalidraw.com (not self-hosted instances)
- Requires manual token entry (no OAuth flow)
- No offline mode
- Public gists only (private can be enabled in code)

### Future Improvements
- [ ] OAuth GitHub authentication
- [ ] Private Gist support toggle
- [ ] Offline draft mode with sync
- [ ] Search and filter drawings
- [ ] Export drawings to other formats
- [ ] Collaboration features
- [ ] Support for self-hosted Excalidraw instances
- [ ] Automatic backup before loading a drawing
- [ ] Drawing preview thumbnails

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Open an issue** first to discuss major changes
2. **Fork the repository** and create a feature branch
3. **Follow the existing code style**:
   - Use TypeScript for all new code
   - Follow React hooks best practices
   - Use Tailwind CSS for styling
4. **Test your changes** thoroughly
5. **Run type checking** before submitting: `pnpm run type-check`
6. **Submit a Pull Request** with a clear description of changes

### PR Checklist
- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] Tested in Chrome browser
- [ ] Extension loads and functions properly
- [ ] No console errors
- [ ] Updated documentation if needed

## License

License: MIT

---

**Note**: This extension is not officially affiliated with Excalidraw or GitHub. It's an independent tool created to enhance the Excalidraw workflow.

