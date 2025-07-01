export interface ExcalidrawData {
  type: "excalidraw";
  version: number;
  source: string;
  elements: unknown[];
  appState: {
    gridSize: number;
    gridStep: number;
    gridModeEnabled: boolean;
    viewBackgroundColor: string;
    lockedMultiSelections: Record<string, unknown>;
  };
  files: Record<string, {
    mimeType: string;
    id: string;
    dataURL: string;
    created: number;
    lastRetrieved: number;
  }>;
} 