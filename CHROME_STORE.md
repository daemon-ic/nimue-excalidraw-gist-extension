# Nimue - Excalidraw Companion

Never lose your Excalidraw drawings again. Sync, manage, and access your diagrams from anywhere with automatic GitHub backup.

## Overview

Nimue seamlessly integrates Excalidraw with GitHub, turning your browser into a powerful diagram management system. Whether you're creating technical diagrams, wireframes, or quick sketches, Nimue ensures every drawing is safely backed up and accessible across all your devices. No more lost work, no manual exports – just draw, save, and sync.

Perfect for developers, designers, and anyone who relies on Excalidraw for visual thinking.

## Key Features

- **Automatic GitHub Sync** – Every drawing is backed up as a GitHub Gist, giving you version control and peace of mind. Access your drawings from any computer.

- **Visual Gallery** – Browse all your drawings in a clean, organized gallery. See when each drawing was last updated and quickly find what you need.

- **One-Click Load & Save** – Click any drawing to instantly load it into Excalidraw. Made changes? Save them back to GitHub with a single click.

- **Drawing Management** – Create new drawings, rename them, duplicate existing ones, or view them directly on GitHub. Everything you need in one place.

- **Zero Setup Friction** – Connect your GitHub account once, and you're ready to go. All your existing GitHub Gists containing Excalidraw drawings automatically appear.

- **Private & Secure** – Your GitHub token stays in your browser. No data passes through our servers – it's just you and GitHub.

## How It Works

1. **Install Nimue** from the Chrome Web Store and pin it to your toolbar.

2. **Connect to GitHub** by entering a Personal Access Token (we'll show you exactly how to create one – it takes 30 seconds).

3. **Open Excalidraw** at https://excalidraw.com and start drawing.

4. **Click the Nimue icon** to see your drawing gallery, save your current work, or load a previous drawing.

That's it! Your drawings are now automatically synced to GitHub, accessible from any device where you install Nimue.

## Why You'll Love It

**Never Lose Work Again** – Browser crashed? Accidentally closed the tab? No problem. Your drawings are safely stored on GitHub, not just in your browser's volatile localStorage.

**Work Across Devices** – Start a diagram on your work computer, refine it on your laptop at home, and present it from your tablet. Nimue keeps everything in sync.

**Version Control for Diagrams** – Because drawings are stored as GitHub Gists, you get built-in version history. Made a mistake? Check the Gist history to see previous versions.

**Organized Workflow** – Stop saving `.excalidraw` files all over your filesystem. Keep everything organized in one place with descriptive names and timestamps.

**Lightning Fast** – Built with modern web technologies (React, Vite, TypeScript), Nimue is responsive and never slows down your browser.

## Privacy & Security

Your privacy matters to us. Here's what you should know:

**No Data Collection** – Nimue doesn't collect, store, or transmit any of your personal information or drawing data. Everything stays between you and GitHub.

**Your Token, Your Browser** – Your GitHub Personal Access Token is stored securely in Chrome's local storage on your device. It never leaves your browser except to authenticate with GitHub's official API.

**Open Source** – The full source code is available on GitHub. You can inspect exactly what the extension does and verify there are no hidden behaviors.

**Minimal Permissions** – Nimue only requests the permissions it needs:
- Access to excalidraw.com – to read and load your drawings
- Storage – to remember your GitHub token
- Tabs – to detect when you're on Excalidraw

**GitHub Gists** – Drawings are stored as GitHub Gists using GitHub's secure API. You control who can see them (public or private) and can delete them at any time.

## Getting Started

1. **Install Nimue** from the Chrome Web Store (click "Add to Chrome").

2. **Pin the extension** to your toolbar for easy access:
   - Click the puzzle icon in your Chrome toolbar
   - Find Nimue in the list
   - Click the pin icon

3. **Create a GitHub Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name like "Nimue Extension"
   - Check the `gist` scope checkbox
   - Click "Generate token" and copy it

4. **Connect Nimue**:
   - Navigate to https://excalidraw.com
   - Click the Nimue icon in your toolbar
   - Click "Connect"
   - Paste your GitHub token and submit

5. **Start using it**:
   - Create a new drawing or modify an existing one in Excalidraw
   - Open Nimue to see your gallery
   - Click the **+** button to create a new named drawing
   - Click the **Save** button to back up your current work
   - Click any drawing thumbnail to load it instantly

## FAQs

**Does this extension store my drawings?**

No. All drawings are stored directly in your GitHub account as Gists. Nimue simply provides an interface to manage them. Your data lives on GitHub's servers, not ours.

**Which websites does it work on?**

Nimue works exclusively on https://excalidraw.com. It does not work on self-hosted Excalidraw instances or other drawing tools.

**Is it free?**

Yes! Nimue is completely free to use. GitHub Gists are also free for both public and private gists.

**Will it slow down my browser?**

No. Nimue is highly optimized and only runs when you're on Excalidraw.com or when you explicitly open the extension popup. It has minimal impact on browser performance.

**Can I use it on other browsers?**

Currently, Nimue is built for Chrome and Chromium-based browsers (Edge, Brave, Vivaldi, etc.). Firefox support may come in the future.

**What happens if I delete a Gist on GitHub?**

If you delete a Gist directly on GitHub, it will no longer appear in Nimue's gallery. The extension only shows Gists that currently exist in your GitHub account.

**Can other people see my drawings?**

By default, Gists are created as public, meaning anyone with the link can view them. However, they won't be easily discoverable. You can also manually create private Gists on GitHub if you need additional privacy.

**Do I need to be connected to the internet?**

Yes. Since Nimue syncs with GitHub, you need an active internet connection to save and load drawings. However, Excalidraw itself works offline for creating drawings.

---

**Support & Feedback**

Found a bug or have a feature request? Visit our GitHub repository or leave a review on the Chrome Web Store. We'd love to hear from you!

**Not affiliated with Excalidraw** – Nimue is an independent extension created by developers who love Excalidraw.

