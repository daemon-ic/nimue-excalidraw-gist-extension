import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GITHUB_API_BASE, REPO_KEYS, REPO_NAME } from '@/shared/config';
import { getGithubTokenFn } from './useGithub';
import type {
  GitHubRepository,
  GitHubFileContent,
  CreateRepositoryRequest,
  CreateFileRequest,
  UpdateFileRequest,
  DeleteFileRequest,
  RepositoryStatus,
  ExcalidrawDrawingMetadata,
  ExcalidrawDrawingWithData,
  ExcalidrawData,
} from '@/types/repository';

// ===== HELPER FUNCTIONS =====

async function makeRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getGithubTokenFn();

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function slugifyFilename(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug}.excalidraw`;
}

export function extractNameFromFilename(filename: string): string {
  return filename
    .replace(/\.excalidraw$/, '')
    .replace(/-/g, ' ')
    .trim();
}

// ===== REPOSITORY API FUNCTIONS =====

async function checkRepositoryExists(owner: string): Promise<RepositoryStatus> {
  try {
    const repo = await makeRequest(`/repos/${owner}/${REPO_NAME}`);
    return { exists: true, repository: repo };
  } catch (error) {
    return { exists: false, repository: null };
  }
}

async function createRepository(owner: string): Promise<GitHubRepository> {
  const request: CreateRepositoryRequest = {
    name: REPO_NAME,
    description: 'Private storage for Excalidraw drawings',
    private: true,
    auto_init: true,
  };

  return makeRequest('/user/repos', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

async function ensureRepositoryExists(owner: string): Promise<GitHubRepository> {
  const status = await checkRepositoryExists(owner);
  if (status.exists && status.repository) {
    return status.repository;
  }
  return createRepository(owner);
}

// ===== FILE API FUNCTIONS =====

async function listFiles(owner: string): Promise<GitHubFileContent[]> {
  await ensureRepositoryExists(owner);

  const contents: GitHubFileContent[] = await makeRequest(
    `/repos/${owner}/${REPO_NAME}/contents`
  );

  // Filter only .excalidraw files
  return contents.filter(file =>
    file.type === 'file' && file.name.endsWith('.excalidraw')
  );
}

async function getFile(owner: string, filename: string): Promise<GitHubFileContent> {
  return makeRequest(`/repos/${owner}/${REPO_NAME}/contents/${filename}`);
}

async function resolveFilenameConflict(
  owner: string,
  filename: string
): Promise<string> {
  try {
    await getFile(owner, filename);
    // File exists, need to find alternative name
    const baseName = filename.replace(/\.excalidraw$/, '');
    let counter = 1;

    while (true) {
      const newFilename = `${baseName}-${counter}.excalidraw`;
      try {
        await getFile(owner, newFilename);
        counter++;
      } catch {
        return newFilename;
      }
    }
  } catch {
    // File doesn't exist, use original name
    return filename;
  }
}

async function createFile(
  owner: string,
  filename: string,
  content: string,
  message?: string
): Promise<GitHubFileContent> {
  await ensureRepositoryExists(owner);

  // Check for conflicts and auto-increment
  const finalFilename = await resolveFilenameConflict(owner, filename);

  const request: CreateFileRequest = {
    message: message || `Create ${finalFilename}`,
    content: btoa(content),
  };

  const result = await makeRequest(
    `/repos/${owner}/${REPO_NAME}/contents/${finalFilename}`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    }
  );

  return result.content;
}

async function updateFile(
  owner: string,
  filename: string,
  content: string,
  sha: string,
  message?: string
): Promise<GitHubFileContent> {
  const request: UpdateFileRequest = {
    message: message || `Update ${filename}`,
    content: btoa(content),
    sha,
  };

  const result = await makeRequest(
    `/repos/${owner}/${REPO_NAME}/contents/${filename}`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    }
  );

  return result.content;
}

async function deleteFile(
  owner: string,
  filename: string,
  sha: string,
  message?: string
): Promise<void> {
  const request: DeleteFileRequest = {
    message: message || `Delete ${filename}`,
    sha,
  };

  await makeRequest(
    `/repos/${owner}/${REPO_NAME}/contents/${filename}`,
    {
      method: 'DELETE',
      body: JSON.stringify(request),
    }
  );
}

// ===== DRAWING HELPERS =====

async function getLastCommitDate(owner: string, filename: string): Promise<string | undefined> {
  try {
    const commits = await makeRequest(
      `/repos/${owner}/${REPO_NAME}/commits?path=${filename}&per_page=1`
    );
    if (commits && commits.length > 0) {
      return commits[0].commit.committer.date;
    }
  } catch (error) {
    console.error(`Failed to fetch last commit for ${filename}:`, error);
  }
  return undefined;
}

async function mapFileToMetadata(
  owner: string,
  file: GitHubFileContent
): Promise<ExcalidrawDrawingMetadata> {
  const lastUpdated = await getLastCommitDate(owner, file.name);

  return {
    filename: file.name,
    name: extractNameFromFilename(file.name),
    sha: file.sha,
    size: file.size,
    htmlUrl: file.html_url,
    downloadUrl: file.download_url,
    lastUpdated,
  };
}

export async function getDrawingContent(
  owner: string,
  filename: string
): Promise<ExcalidrawDrawingWithData> {
  const file = await getFile(owner, filename);

  if (!file.content) {
    throw new Error('File content not available');
  }

  // Decode base64 content
  const decodedContent = atob(file.content);
  const drawingData = JSON.parse(decodedContent) as ExcalidrawData;

  return {
    ...(await mapFileToMetadata(owner, file)),
    drawingData,
  };
}

// ===== REACT HOOKS =====

export function useRepositoryStatus(owner: string | undefined) {
  return useQuery({
    queryKey: REPO_KEYS.REPO_STATUS,
    queryFn: () => checkRepositoryExists(owner!),
    enabled: !!owner,
  });
}

export function useDrawings(owner: string | undefined) {
  return useQuery({
    queryKey: REPO_KEYS.FILE_LIST,
    queryFn: async () => {
      const files = await listFiles(owner!);
      return Promise.all(files.map(file => mapFileToMetadata(owner!, file)));
    },
    enabled: !!owner,
  });
}

export function useDrawing(owner: string | undefined, filename: string | undefined) {
  return useQuery({
    queryKey: REPO_KEYS.FILE_DETAIL(filename || ''),
    queryFn: () => getDrawingContent(owner!, filename!),
    enabled: !!owner && !!filename,
  });
}

export function useCreateDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      name,
      content,
    }: {
      owner: string;
      name: string;
      content: string;
    }) => {
      const filename = slugifyFilename(name);
      const file = await createFile(owner, filename, content);
      return mapFileToMetadata(owner, file);
    },
    onSuccess: (newDrawing) => {
      queryClient.setQueryData<ExcalidrawDrawingMetadata[]>(
        REPO_KEYS.FILE_LIST,
        (old) => [...(old || []), newDrawing]
      );
    },
  });
}

export function useUpdateDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      filename,
      content,
      sha,
    }: {
      owner: string;
      filename: string;
      content: string;
      sha: string;
    }) => {
      const file = await updateFile(owner, filename, content, sha);
      return mapFileToMetadata(owner, file);
    },
    onSuccess: (updatedDrawing) => {
      queryClient.setQueryData(
        REPO_KEYS.FILE_DETAIL(updatedDrawing.filename),
        updatedDrawing
      );
      queryClient.invalidateQueries({ queryKey: REPO_KEYS.FILE_LIST });
    },
  });
}

export function useRenameDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      oldFilename,
      newName,
      content,
      sha,
    }: {
      owner: string;
      oldFilename: string;
      newName: string;
      content: string;
      sha: string;
    }) => {
      const newFilename = slugifyFilename(newName);

      // Check if trying to rename to same name
      if (oldFilename === newFilename) {
        throw new Error('New name is the same as current name');
      }

      // Create new file
      const newFile = await createFile(owner, newFilename, content, `Rename to ${newName}`);

      // Delete old file
      await deleteFile(owner, oldFilename, sha, `Rename from ${oldFilename}`);

      return mapFileToMetadata(owner, newFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPO_KEYS.FILE_LIST });
    },
  });
}

export function useDeleteDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      filename,
      sha,
    }: {
      owner: string;
      filename: string;
      sha: string;
    }) => {
      await deleteFile(owner, filename, sha);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPO_KEYS.FILE_LIST });
    },
  });
}
