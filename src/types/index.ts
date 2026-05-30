export type GitHubUser = {
  login: string;
  name: string | null;
};

export type DrawingMeta = {
  filename: string;
  name: string;
  sha: string;
  htmlUrl: string;
  lastUpdated?: string;
};

export type ExcalidrawScene = {
  type: 'excalidraw';
  version: 2;
  source: string;
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, BinaryFile>;
};

export type BinaryFile = {
  id: string;
  mimeType: string;
  dataURL: string;
  created: number;
  lastRetrieved?: number;
};

export type AutosavePayload = {
  owner: string;
  drawing: DrawingMeta;
  content: string;
};
