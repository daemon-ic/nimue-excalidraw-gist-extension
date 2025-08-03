// import { ExcalidrawData } from '@/types/excalidraw';
// import browser from 'webextension-polyfill';
// import { Gist, UpdateGistRequest, CreateGistRequest } from '@/types/gist';
// import { getGithubTokenFn } from '../hooks/useGithub';


// // ===== API FUNCTIONS =====

// const GITHUB_API_BASE = 'https://api.github.com';

// async function makeRequest(endpoint: string, options: RequestInit = {}) {
//   const token = await getGithubTokenFn();
  
//   const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
//     headers: {
//       'Authorization': `token ${token}`,
//       'Accept': 'application/vnd.github.raw+json',
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//     ...options,
//   });

//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${error}`);
//   }

//   return response.json();
// }


// export async function getAllGists(page = 1, perPage = 30): Promise<Gist[]> {
//   return makeRequest(`/gists?page=${page}&per_page=${perPage}`);
// }

// export async function getGist(gistId: string): Promise<Gist> {
//   return makeRequest(`/gists/${gistId}`);
// }

// export async function createGist(request: CreateGistRequest): Promise<Gist> {
//   return makeRequest('/gists', {
//     method: 'POST',
//     body: JSON.stringify(request),
//   });
// }

// export async function updateGist(gistId: string, request: UpdateGistRequest): Promise<Gist> {
//   return makeRequest(`/gists/${gistId}`, {
//     method: 'PATCH',
//     body: JSON.stringify(request),
//   });
// }

// export async function deleteGist(gistId: string): Promise<void> {
//   await makeRequest(`/gists/${gistId}`, {
//     method: 'DELETE',
//   });
// }

// ===== EXCALIDRAW SPECIFIC HELPERS =====