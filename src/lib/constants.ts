export const GITHUB_API = 'https://api.github.com';
export const REPO_NAME = 'nimue-excalidraw-storage';
export const EXCALIDRAW_ORIGIN = 'https://excalidraw.com';

export const STORAGE = {
  token: 'github_token',
  activeDrawing: 'active_drawing',
  settings: 'settings',
} as const;

export type Settings = {
  autosave: boolean;
  autosaveIntervalMs: number;
};

export const DEFAULT_SETTINGS: Settings = {
  autosave: true,
  autosaveIntervalMs: 30_000,
};

export const QUERY = {
  token: ['github', 'token'] as const,
  user: ['github', 'user'] as const,
  drawings: ['drawings'] as const,
  active: ['active-drawing'] as const,
  settings: ['settings'] as const,
};

export const MSG = {
  autosave: 'AUTOSAVE',
  openUrl: 'OPEN_URL',
} as const;
