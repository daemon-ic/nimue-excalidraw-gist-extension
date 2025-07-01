import { ExcalidrawData } from '@/types/excalidraw';
import browser from 'webextension-polyfill';
import { Gist, UpdateGistRequest, CreateGistRequest } from '@/types/gist';


// ===== API FUNCTIONS =====

const GITHUB_API_BASE = 'https://api.github.com';

async function makeRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getStoredToken();
  
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${error}`);
  }

  return response.json();
}

async function getStoredToken(): Promise<string> {
  const result = await browser.storage.local.get(['github_token']);
  const token = result.github_token;
  
  if (!token) {
    throw new Error('No GitHub token found. Please connect your GitHub account first.');
  }
  
  return token;
}

// ===== GIST OPERATIONS =====

/**
 * Get all gists for the authenticated user
 */
export async function getAllGists(page = 1, perPage = 30): Promise<Gist[]> {
  return makeRequest(`/gists?page=${page}&per_page=${perPage}`);
}

/**
 * Get a specific gist by ID
 */
export async function getGist(gistId: string): Promise<Gist> {
  return makeRequest(`/gists/${gistId}`);
}

/**
 * Create a new gist
 */
export async function createGist(request: CreateGistRequest): Promise<Gist> {
  return makeRequest('/gists', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Update an existing gist
 */
export async function updateGist(gistId: string, request: UpdateGistRequest): Promise<Gist> {
  return makeRequest(`/gists/${gistId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

/**
 * Delete a gist
 */
export async function deleteGist(gistId: string): Promise<void> {
  await makeRequest(`/gists/${gistId}`, {
    method: 'DELETE',
  });
}

// ===== EXCALIDRAW SPECIFIC HELPERS =====

/**
 * Create a gist with Excalidraw data
 */
export async function createExcalidrawGist(
  drawingData: ExcalidrawData,
  filename: string = 'drawing.excalidraw',
  description?: string,
  isPublic: boolean = false
): Promise<Gist> {
  return createGist({
    description: description || 'Excalidraw drawing',
    public: isPublic,
    files: {
      [filename]: {
        content: JSON.stringify(drawingData, null, 2),
      },
    },
  });
}

/**
 * Update a gist with new Excalidraw data
 */
export async function updateExcalidrawGist(
  gistId: string,
  drawingData: ExcalidrawData,
  filename: string = 'drawing.excalidraw'
): Promise<Gist> {
  return updateGist(gistId, {
    files: {
      [filename]: {
        content: JSON.stringify(drawingData, null, 2),
      },
    },
  });
}

/**
 * Extract Excalidraw data from a gist
 */
export async function extractExcalidrawData(gist: Gist, filename: string = 'drawing.excalidraw'): Promise<ExcalidrawData | null> {
  const file = gist.files[filename];
  
  if (!file) {
    return null;
  }

  let content: string;

  // If content is already available, use it
  if (file.content) {
    content = file.content;
  } 
  // Otherwise, fetch the content from the raw URL
  else if (file.raw_url) {
    try {
      const token = await getStoredToken();
      const response = await fetch(file.raw_url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.status}`);
      }
      
      content = await response.text();
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      return null;
    }
  } else {
    return null;
  }

  try {
    return JSON.parse(content) as ExcalidrawData;
  } catch (error) {
    console.error('Failed to parse Excalidraw data:', error);
    return null;
  }
}

/**
 * Find all gists containing Excalidraw files
 */
export function findExcalidrawGists(gists: Gist[]): Gist[] {
  return gists.filter(gist => 
    Object.values(gist.files).some(file => 
      file.filename?.endsWith('.excalidraw') || 
      file.filename?.endsWith('.excalidraw.json') ||
      file.type === 'application/json'
    )
  );
}

/**
 * Get Excalidraw metadata from a gist
 */
export function getExcalidrawMetadata(gist: Gist, filename: string = 'drawing.excalidraw'): {
  gistId: string;
  filename: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner: string;
  htmlUrl: string;
  fileSize: number;
  hasContent: boolean;
} | null {
  const file = gist.files[filename];
  
  if (!file) {
    return null;
  }

  return {
    gistId: gist.id,
    filename: file.filename || filename,
    description: gist.description,
    isPublic: gist.public,
    createdAt: gist.created_at,
    updatedAt: gist.updated_at,
    owner: gist.owner.login,
    htmlUrl: gist.html_url,
    fileSize: file.size || 0,
    hasContent: !!file.content,
  };
} 