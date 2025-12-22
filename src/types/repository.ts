// ===== GITHUB REPOSITORY TYPES =====

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

// ===== FILE CONTENT TYPES =====

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string; // base64 encoded
  encoding?: string;
}

// ===== REQUEST TYPES =====

export interface CreateRepositoryRequest {
  name: string;
  description?: string;
  private: boolean;
  auto_init?: boolean;
}

export interface CreateFileRequest {
  message: string;
  content: string; // base64 encoded
  branch?: string;
}

export interface UpdateFileRequest {
  message: string;
  content: string; // base64 encoded
  sha: string; // required for updates
  branch?: string;
}

export interface DeleteFileRequest {
  message: string;
  sha: string;
  branch?: string;
}

// ===== DRAWING METADATA =====

export interface ExcalidrawDrawingMetadata {
  filename: string; // e.g., "my-diagram.excalidraw"
  name: string; // human-readable name (without .excalidraw)
  sha: string;
  size: number;
  htmlUrl: string;
  downloadUrl: string | null;
  lastUpdated?: string; // ISO 8601 date string
}

export interface ExcalidrawDrawingWithData extends ExcalidrawDrawingMetadata {
  drawingData: ExcalidrawData;
}

// ===== REPOSITORY STATUS =====

export interface RepositoryStatus {
  exists: boolean;
  repository: GitHubRepository | null;
}

// ===== EXCALIDRAW DATA TYPE =====

export interface ExcalidrawData {
  type: string;
  version: number;
  source: string;
  elements: any[];
  appState: any;
  files: any;
}
