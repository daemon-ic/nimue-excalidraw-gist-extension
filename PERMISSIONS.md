CHROME EXTENSION PERMISSIONS JUSTIFICATION

This document explains why Nimue requires each Chrome permission.

================================================================================
SINGLE PURPOSE
================================================================================

Nimue has one clearly defined purpose:

  To manage and sync Excalidraw drawings with GitHub Gists.

All features and permissions serve this single purpose:
  - Save drawings from Excalidraw to GitHub as Gists
  - Load saved drawings back into Excalidraw
  - Organize and browse your drawing collection
  - Manage drawing metadata (rename, duplicate, view on GitHub)

The extension does not perform any other functions, track user behavior, 
inject ads, or modify web pages beyond its stated purpose.

================================================================================
PERMISSION SUMMARY
================================================================================

activeTab
  Purpose: Identify when user is on Excalidraw

tabs
  Purpose: Query the current active tab

storage
  Purpose: Store GitHub token and user preferences

scripting
  Purpose: Read and write Excalidraw drawing data

host_permissions: excalidraw.com
  Purpose: Access Excalidraw's localStorage

================================================================================
DETAILED JUSTIFICATIONS
================================================================================

activeTab
----------
Why we need it:
  To identify when the user is currently viewing Excalidraw.

How we use it:
  The extension checks if the active tab is on excalidraw.com before 
  attempting to read or load drawing data. This prevents the extension 
  from running on unrelated websites.

Code location:
  src/services/extension/chrome.ts
  src/services/extension/extract.ts


tabs
----
Why we need it:
  To query information about the current browser tab.

How we use it:
  We use chrome.tabs.query({ active: true, currentWindow: true }) to get 
  the active tab's ID and URL. This is necessary to:
  - Verify the user is on Excalidraw before reading drawing data
  - Target the correct tab when injecting scripts to load drawings
  - Display appropriate UI states in the extension popup

Code location:
  src/services/extension/chrome.ts
  src/services/extension/extract.ts
  src/services/background/background-web-scripts.ts


storage
-------
Why we need it:
  To securely store user settings and authentication.

How we use it:
  We store two pieces of data locally in the browser:
  1. GitHub Personal Access Token - Required to authenticate API requests 
     to GitHub Gists
  2. Active Project Selection - Remembers which drawing is currently selected

  All data stays in the user's browser and is never transmitted to any 
  third-party servers (only to GitHub's official API).

Code location:
  src/hooks/useGithub.ts
  src/hooks/useActiveProject.ts


scripting
---------
Why we need it:
  To read and write Excalidraw drawing data from the web page.

How we use it:
  We use chrome.scripting.executeScript() to:
  1. Read drawings - Extract drawing data from Excalidraw's localStorage 
     (excalidraw, excalidraw-state, version-files)
  2. Load drawings - Write selected drawing data back to localStorage and 
     reload the page

  This is the only way to interact with Excalidraw's internal state, as 
  the data is stored in the page's localStorage (not accessible from the 
  extension directly).

Code location:
  src/services/extension/extract.ts
  src/services/background/background-web-scripts.ts


host_permissions: https://excalidraw.com/*
-------------------------------------------
Why we need it:
  To access and modify Excalidraw's page content and localStorage.

How we use it:
  This permission allows the extension to:
  - Run content scripts on Excalidraw pages
  - Execute scripts that read/write to localStorage
  - Inject code that loads drawings into the active canvas

Scope:
  This permission is strictly limited to excalidraw.com only. The extension 
  has no access to any other websites.

Code location:
  src/manifest.json (content_scripts and web_accessible_resources sections)

================================================================================
PRIVACY COMMITMENT
================================================================================

- No tracking or analytics - We don't collect any usage data
- No external servers - All data flows between your browser and GitHub only
- Open source - All code is publicly available for inspection
- Minimal scope - Permissions are limited to only what's necessary

================================================================================
QUESTIONS?
================================================================================

If you have concerns about any permission, please open an issue on our 
GitHub repository.

