import { Gist, UpdateGistRequest, CreateGistRequest } from '@/types/gist';
import { getGithubTokenFn, GithubValidation } from './useGithub';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GIST_KEYS, GITHUB_API_BASE } from '@/shared/config';

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
    cache: 'no-store', // Force fresh request
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

export async function getGist(gistId: string): Promise<Gist> {
  return makeRequest(`/gists/${gistId}`);
}

export async function deleteGist(gistId: string): Promise<void> {
  await makeRequest(`/gists/${gistId}`, {
    method: 'DELETE',
  });
}

// ===== GIST HOOKS =====

export async function createGistFn(request: CreateGistRequest): Promise<Gist> {
  return makeRequest('/gists', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function useCreateGist() {
  const queryClient = useQueryClient();
  const { mutate: createGist, isPending: isCreatingGist, data: createdGist } = useMutation({
    mutationFn: createGistFn,
    onSuccess: (newGist) => {
      queryClient.setQueryData(GIST_KEYS.LIST, (oldGists: Gist[]) => [...oldGists, newGist]);
    },
  });
  return {
    createGist,
    isCreatingGist,
    createdGist,
  };
} 

export async function updateGistFn(gistId: string, request: UpdateGistRequest): Promise<Gist> {
  return makeRequest(`/gists/${gistId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export function useUpdateGist() {
  const queryClient = useQueryClient();
  const { mutate: updateGist, isPending: isUpdatingGist, data: updatedGist } = useMutation({
    mutationFn: ({gistId, request}: {gistId: string, request: UpdateGistRequest}) => updateGistFn(gistId, request),
    onSuccess: (updatedGist) => { 
      queryClient.setQueryData(GIST_KEYS.DETAIL(updatedGist.id), updatedGist);
    },
  });
  return {
    updateGist,
    isUpdatingGist,
    updatedGist,
  };
} 

export async function getAllGists(page = 1, perPage = 30): Promise<Gist[]> {
  return makeRequest(`/gists?page=${page}&per_page=${perPage}`);
}

export function useGetGists(githubToken: string, currentValidation: GithubValidation) {
  const { data: gists, isLoading: isGistsLoading, error: gistsError, refetch: refetchGists } = useQuery({
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

export function useGetGist(gistId: string) {
  const { data: gist, isLoading, error } = useQuery({
    queryKey: GIST_KEYS.DETAIL(gistId),
    queryFn: () => getGist(gistId),
    enabled: !!gistId,
  });

  return {
    gist,
    isLoading,
    error,
  };
}


