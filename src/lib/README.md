# Simple GitHub Gist Library

A minimal TypeScript library that matches exactly what `excali-gist.sh` does - just upload/update files with filename mapping and download by ID or filename.

## What it does (exactly like excali-gist.sh)

1. **Upload file** (`-f file.excalidraw`) - Creates new gist or updates existing one using filename mapping
2. **Download by ID** (`-D gist_id`) - Downloads gist content by ID
3. **Download by filename** (`-d filename`) - Downloads gist using filename→gist_id mapping
4. **File mapping** - Stores `filename=gist_id` mappings in localStorage
5. **Token management** - Stores GitHub token in localStorage

## Usage

### Basic Upload (like `excali-gist.sh -f file.excalidraw`)

```typescript
import { useUploadFile } from '@/hooks/useSimpleGist';

function UploadComponent() {
  const uploadMutation = useUploadFile();

  const handleUpload = () => {
    uploadMutation.mutate({
      filePath: 'sketch.excalidraw',
      fileContent: '{"elements":[],"appState":{}}',
      options: {
        description: 'My sketch',
        public: false,
        saveMapping: true
      }
    });
  };

  return (
    <button onClick={handleUpload}>
      Upload File
    </button>
  );
}
```

### Download by ID (like `excali-gist.sh -D gist_id`)

```typescript
import { useDownloadGist } from '@/hooks/useSimpleGist';

function DownloadComponent() {
  const downloadMutation = useDownloadGist();

  const handleDownload = () => {
    downloadMutation.mutate({
      gistId: 'abc123...',
      options: { overwrite: true }
    });
  };

  return (
    <button onClick={handleDownload}>
      Download by ID
    </button>
  );
}
```

### Download by Filename (like `excali-gist.sh -d filename`)

```typescript
import { useDownloadByFilename } from '@/hooks/useSimpleGist';

function DownloadComponent() {
  const downloadMutation = useDownloadByFilename();

  const handleDownload = () => {
    downloadMutation.mutate({
      filename: 'sketch.excalidraw',
      options: { overwrite: true }
    });
  };

  return (
    <button onClick={handleDownload}>
      Download by Filename
    </button>
  );
}
```

### Check if File Exists

```typescript
import { useGistExists } from '@/hooks/useSimpleGist';

function CheckComponent() {
  const { exists, gistId } = useGistExists('sketch.excalidraw');

  return (
    <div>
      {exists ? (
        <p>File exists with gist ID: {gistId}</p>
      ) : (
        <p>File not found in mapping</p>
      )}
    </div>
  );
}
```

## API Reference

### Core Library (`simple-gist.ts`)

```typescript
// Upload file (create or update)
await simpleGist.uploadFile(filePath: string, options?: {
  description?: string;
  public?: boolean;
  forceGistId?: string;
  saveMapping?: boolean;
}): Promise<{ gist: any; isNew: boolean; url: string }>

// Download gist by ID
await simpleGist.downloadGist(gistId: string, options?: {
  overwrite?: boolean;
}): Promise<{ files: string[]; gist: any }>

// Download gist by filename
await simpleGist.downloadByFilename(filename: string, options?: {
  overwrite?: boolean;
}): Promise<{ files: string[]; gist: any }>

// Token management
await simpleGist.saveConfig(token: string): Promise<void>
await simpleGist.loadConfig(): Promise<GistConfig>

// Mapping management
await simpleGist.getGistId(filename: string): Promise<string | null>
await simpleGist.setGistId(filename: string, gistId: string): Promise<void>
await simpleGist.loadMapping(): Promise<GistMapping>
```

### React Query Hooks (`useSimpleGist.ts`)

```typescript
// Configuration
const { data: isConfigured } = useGistConfig();
const saveTokenMutation = useSaveGistToken();

// Mapping
const { data: mapping } = useGistMapping();
const { data: gistId } = useGistId('filename');
const { exists, gistId } = useGistExists('filename');

// Main operations
const uploadMutation = useUploadFile();
const downloadGistMutation = useDownloadGist();
const downloadByFilenameMutation = useDownloadByFilename();
```

## Migration from excali-gist.sh

| excali-gist.sh | Simple Gist Library |
|----------------|-------------------|
| `-f file.excalidraw` | `uploadFile('file.excalidraw', { fileContent: '...' })` |
| `-D gist_id` | `downloadGist('gist_id')` |
| `-d filename` | `downloadByFilename('filename')` |
| `gist_map.conf` | `loadMapping()` / `saveMapping()` |
| `excali-gist.conf` | `saveConfig()` / `loadConfig()` |
| `-p` / `-s` | `options.public: true/false` |
| `-u gist_id` | `options.forceGistId: 'gist_id'` |

## Example Component

See `SimpleGistManager.tsx` for a complete example that demonstrates:
- Token configuration
- File upload
- Download by ID or filename
- File mapping display

## That's it!

This library does exactly what your CLI script does - no more, no less. Simple and focused. 