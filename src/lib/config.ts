export const ACTIONS = {
    "LOAD_DRAWING": "load_drawing",
    "SAVE_DRAWING": "save_drawing",
    "UPDATE_GIST": "update_gist",
    "CREATE_GIST": "create_gist",
    "COPY_GIST": "copy_gist",
    "DELETE_DRAWING": "delete_drawing",
    "RENAME_DRAWING": "rename_drawing",
    "COPY_DRAWING": "copy_drawing",
}


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
    all: ['gists'] as const,
    lists: () => [...GIST_KEYS.all, 'list'] as const,
    list: (filters: { page?: number; perPage?: number }) => [...GIST_KEYS.lists(), filters] as const,
    details: () => [...GIST_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...GIST_KEYS.details(), id] as const,
    excalidraw: () => [...GIST_KEYS.all, 'excalidraw'] as const,
  };