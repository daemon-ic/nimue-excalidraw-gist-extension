import { ExcalidrawData } from '@/types/excalidraw';
import browser from 'webextension-polyfill';
import { Gist, UpdateGistRequest, CreateGistRequest } from '@/types/gist';
import { getGithubTokenFn, GithubValidation } from './useGithub';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GIST_KEYS, GITHUB_API_BASE } from '@/services/config';

// ===== API FUNCTIONS =====

async function makeRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getGithubTokenFn();
  
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.raw+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${error}`);
  }

  const json = await response.json();
  console.log('json', json)
  return json;
}

// ===== GIST API FUNCTIONS =====

export async function getAllGists(page = 1, perPage = 30): Promise<Gist[]> {
  return makeRequest(`/gists?page=${page}&per_page=${perPage}`);
}

export async function getGist(gistId: string): Promise<Gist> {
  return makeRequest(`/gists/${gistId}`);
}

export async function createGistFn(request: CreateGistRequest): Promise<Gist> {
  return makeRequest('/gists', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updateGistFn(gistId: string, request: UpdateGistRequest): Promise<Gist> {
  return makeRequest(`/gists/${gistId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export async function deleteGist(gistId: string): Promise<void> {
  await makeRequest(`/gists/${gistId}`, {
    method: 'DELETE',
  });
}

// ===== GIST HOOKS =====

export function useCreateGist() {
  const queryClient = useQueryClient();
  const { mutate: createGist, isPending: isCreatingGist, data: createdGist } = useMutation({
    mutationFn: createGistFn,
    onSuccess: (newGist) => {
      // Only cache the detail - let the calling component handle list updates
      queryClient.setQueryData(GIST_KEYS.DETAIL(newGist.id), newGist);
    },
  });

  return {
    createGist,
    isCreatingGist,
    createdGist, // This will contain the newly created gist
  };
} 

export function useUpdateGist() {
  const queryClient = useQueryClient();
  const { mutate: updateGist, isPending: isUpdatingGist, data: updatedGist } = useMutation({
      mutationFn: ({gistId, request}: {gistId: string, request: UpdateGistRequest}) => updateGistFn(gistId, request)  ,
      onSuccess: (updatedGist) => { 
        // Only cache the detail - let the calling component handle list updates
        queryClient.setQueryData(GIST_KEYS.DETAIL(updatedGist.id), updatedGist);
      },
    });
  return {
    updateGist,
    isUpdatingGist,
    updatedGist,
  };
} 

export function useGetGists(githubToken: string, currentValidation: GithubValidation) {
  const { data: gists, isLoading: isGistsLoading, error:gistsError, refetch: refetchGists } = useQuery({
    queryKey: GIST_KEYS.LIST,
    queryFn: () => getAllGists(),
    enabled: !!githubToken && !!currentValidation?.isValid,
  });

  return {
    gists,
    isGistsLoading,
    gistsError,
    refetchGists,
  };
}


