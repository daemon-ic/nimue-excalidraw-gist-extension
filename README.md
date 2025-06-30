# Chrome Extension with Vite, Tailwind CSS, and TypeScript

A modern Chrome extension development setup using Vite, Tailwind CSS, and TypeScript for optimal developer experience.

## Features

- ⚡ **Vite** - Fast build tool and dev server
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔷 **TypeScript** - Type-safe JavaScript
- ⚛️ **React** - Modern UI library
- 📦 **WebExtension Polyfill** - Cross-browser compatibility
- 🔧 **Hot Module Replacement** - Instant development feedback
- 🚀 **pnpm** - Fast, disk space efficient package manager

## Prerequisites

Make sure you have pnpm installed:

```bash
npm install -g pnpm
```

## Project Structure

```
vite/
├── src/
│   ├── components/
│   │   ├── Popup.tsx          # Main popup component
│   │   └── Options.tsx        # Options page component
│   ├── styles/
│   │   └── index.css          # Tailwind CSS and custom styles
│   ├── background.ts          # Service worker
│   ├── content.ts             # Content script
│   ├── popup.html             # Popup entry point
│   ├── popup.tsx              # Popup React entry
│   ├── options.html           # Options page entry
│   ├── options.tsx            # Options React entry
│   └── manifest.json          # Extension manifest
├── dist/                      # Built extension (generated)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## Getting Started

### 1. Install Dependencies

```bash
cd vite
pnpm install
```

### 2. Development

```bash
# Start development server (for popup/options pages)
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Clean build artifacts and dependencies
pnpm clean
```

### 3. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension should now appear in your extensions list

## Development Workflow

### Building

The build process creates a `dist` folder with the following structure:

```
dist/
├── js/
│   ├── popup.js
│   ├── options.js
│   ├── background.js
│   └── content.js
├── css/
│   └── popup.css
├── assets/
│   └── (icons and other assets)
├── popup.html
├── options.html
└── manifest.json
```

### Development vs Production

- **Development**: Use `pnpm dev` for hot reloading of popup/options pages
- **Production**: Use `pnpm build` to create optimized files for the extension

### File Changes

After making changes to:
- **React components**: Rebuild with `pnpm build`
- **Background/content scripts**: Rebuild and reload extension
- **Manifest**: Rebuild and reload extension

## Package Management with pnpm

### Adding Dependencies

```bash
# Add production dependency
pnpm add <package-name>

# Add development dependency
pnpm add -D <package-name>

# Add specific version
pnpm add <package-name>@<version>
```

### Managing Dependencies

```bash
# Install all dependencies
pnpm install

# Update dependencies
pnpm update

# Remove dependency
pnpm remove <package-name>

# Clean install (remove node_modules and reinstall)
pnpm clean && pnpm install
```

### pnpm Benefits

- **Faster**: Parallel installation and efficient caching
- **Disk space efficient**: Shared dependencies across projects
- **Strict**: Prevents phantom dependencies
- **Monorepo friendly**: Built-in workspace support

## Extension Features

### Popup
- Counter with persistent storage
- Current tab URL display
- Modern UI with Tailwind CSS

### Options Page
- Extension settings management
- Toggle switches for features
- Theme selection

### Background Script
- Service worker for extension logic
- Message handling between components
- Tab event listeners

### Content Script
- Runs on web pages
- Floating action button
- Page interaction capabilities

## Configuration

### Vite Config (`vite.config.ts`)
- Multiple entry points for different extension parts
- Optimized build output structure
- React plugin integration

### TypeScript Config (`tsconfig.json`)
- Strict type checking
- Chrome extension types
- Path aliases for clean imports

### Tailwind Config (`tailwind.config.js`)
- Custom color palette
- Extension-specific utilities
- Content paths for purging

## API Usage

### Storage
```typescript
// Local storage (persists per device)
await browser.storage.local.set({ key: 'value' })
const result = await browser.storage.local.get(['key'])

// Sync storage (syncs across devices)
await browser.storage.sync.set({ key: 'value' })
const result = await browser.storage.sync.get(['key'])
```

### Messaging
```typescript
// Send message to background script
const response = await browser.runtime.sendMessage({
  action: 'getData',
  data: 'some data'
})

// Listen for messages
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle message
  sendResponse({ success: true })
})
```

### Tabs
```typescript
// Get current tab
const tabs = await browser.tabs.query({ active: true, currentWindow: true })
const currentTab = tabs[0]

// Execute script in tab
await browser.scripting.executeScript({
  target: { tabId: currentTab.id },
  func: () => console.log('Hello from content script!')
})
```

## Customization

### Adding New Components
1. Create component in `src/components/`
2. Import and use in popup/options
3. Add any new styles to `src/styles/index.css`

### Adding New Permissions
1. Update `src/manifest.json` permissions array
2. Add corresponding API usage in background/content scripts

### Styling
- Use Tailwind utility classes for styling
- Add custom CSS in `src/styles/index.css`
- Use `@apply` directive for component styles

## Troubleshooting

### Common Issues

1. **Extension not loading**: Check manifest.json syntax and file paths
2. **TypeScript errors**: Run `pnpm type-check` to identify issues
3. **Build errors**: Ensure all dependencies are installed with `pnpm install`
4. **Hot reload not working**: Popup/options pages need manual refresh
5. **pnpm not found**: Install pnpm globally with `npm install -g pnpm`

### Debugging

1. **Background script**: Check `chrome://extensions/` > "service worker" link
2. **Content script**: Use browser dev tools on web pages
3. **Popup**: Right-click extension icon > "Inspect popup"

### pnpm Specific Issues

1. **Peer dependency warnings**: These are normal with pnpm's strict mode
2. **Missing dependencies**: Use `pnpm add` to install missing packages
3. **Lock file conflicts**: Delete `pnpm-lock.yaml` and run `pnpm install`

## Production Deployment

1. Build the extension: `pnpm build`
2. Test thoroughly in Chrome
3. Package for Chrome Web Store (if applicable)
4. Update version in `package.json` and `manifest.json`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this setup for your own projects! # nimue-excalidraw-gist-extension
