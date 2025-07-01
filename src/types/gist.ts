export interface Gist {
  url: string;
  forks_url: string;
  commits_url: string;
  id: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: Record<string, {
    filename: string;
    type: string;
    language: string | null;
    raw_url: string;
    size: number;
    truncated?: boolean;
    content?: string;
  }>;
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string;
  comments: number;
  user: null | {
    login: string;
    id: number;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  comments_enabled: boolean;
  comments_url: string;
  owner: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    user_view_type: string;
    site_admin: boolean;
  };
  truncated: boolean;
}

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateGistRequest {
  description?: string;
  public?: boolean;
  files: Record<string, { content: string }>;
}

export interface UpdateGistRequest {
  description?: string;
  files: Record<string, { content?: string; filename?: string } | null>;
}

export interface GistComment {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
  user: {
    login: string;
    id: number;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  created_at: string;
  updated_at: string;
}

// ===== UTILITY TYPES =====

export type GistFile = Gist['files'][string];

export type GistOwner = Gist['owner'];

export type GistUser = NonNullable<Gist['user']>;

export type ExcalidrawGist = Gist & {
  files: Record<string, GistFile & {
    filename: string;
    content?: string;
  }>;
};

// ===== FILTER TYPES =====

export interface GistFilters {
  page?: number;
  per_page?: number;
  since?: string;
}

export interface GistSearchFilters extends GistFilters {
  query?: string;
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  order?: 'asc' | 'desc';
}

// ===== API RESPONSE TYPES =====

export interface GistListResponse extends Array<Gist> {}

export interface GistErrorResponse {
  message: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
}

// ===== EXCALIDRAW SPECIFIC TYPES =====

export interface ExcalidrawGistMetadata {
  gistId: string;
  filename: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner: string;
  htmlUrl: string;
}

export interface ExcalidrawGistWithData extends ExcalidrawGistMetadata {
  drawingData: any; // Replace with your ExcalidrawData type
} 