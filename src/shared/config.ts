export const GITHUB_API_BASE = 'https://api.github.com';



export const GITHUB_KEYS = {
    TOKEN: ['github', 'token'],
    VALIDATION: ['github', 'validation'],
  }

export const CHROME_KEYS = {
    CURRENT_TAB: ['chrome', 'currentTab'],
}

export const STORAGE_KEYS = {
    GITHUB_TOKEN: 'github_token',
    ACTIVE_PROJECT: 'active_project',
}

export const GIST_KEYS = {
    LIST: ['gists', 'list'],
    DETAIL: (id: string) => ['gists', 'detail', id],
  };

export const GIST_FILENAME = 'drawing.excalidraw'

export const REPO_KEYS = {
  REPO_STATUS: ['excalidraw-repo', 'status'],
  FILE_LIST: ['excalidraw-repo', 'files'],
  FILE_DETAIL: (filename: string) => ['excalidraw-repo', 'file', filename],
};

export const REPO_NAME = 'excalidraw-drawings';