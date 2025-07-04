export const GITHUB_KEYS = {
    TOKEN: ['github', 'token'],
    VALIDATION: ['github', 'validation'],
  }

export const CHROME_KEYS = {
    CURRENT_TAB: ['chrome', 'currentTab'],
}

export const STORAGE_KEYS = {
    GITHUB_TOKEN: 'github_token',
}

export const GIST_KEYS = {
    all: ['gists'] as const,
    lists: () => [...GIST_KEYS.all, 'list'] as const,
    list: (filters: { page?: number; perPage?: number }) => [...GIST_KEYS.lists(), filters] as const,
    details: () => [...GIST_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...GIST_KEYS.details(), id] as const,
    excalidraw: () => [...GIST_KEYS.all, 'excalidraw'] as const,
  };