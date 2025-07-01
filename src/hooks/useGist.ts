import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllGists,
  getGist,
  createGist,
  updateGist,
  deleteGist,
  createExcalidrawGist,
  updateExcalidrawGist,
  extractExcalidrawData,
  findExcalidrawGists,
  getExcalidrawMetadata,
} from '@/lib/gist';
import { ExcalidrawData } from '@/types/excalidraw';
import { UpdateGistRequest } from '@/types/gist';

// ===== QUERY KEYS =====
export const gistKeys = {
  all: ['gists'] as const,
  lists: () => [...gistKeys.all, 'list'] as const,
  list: (filters: { page?: number; perPage?: number }) => [...gistKeys.lists(), filters] as const,
  details: () => [...gistKeys.all, 'detail'] as const,
  detail: (id: string) => [...gistKeys.details(), id] as const,
  excalidraw: () => [...gistKeys.all, 'excalidraw'] as const,
};

// ===== BASIC GIST HOOKS =====

/**
 * Get all gists for the authenticated user
 */
export function useGists(page = 1, perPage = 30, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gistKeys.list({ page, perPage }),
    queryFn: () => getAllGists(page, perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}

/**
 * Get a specific gist by ID
 */
export function useGist(gistId: string) {
  return useQuery({
    queryKey: gistKeys.detail(gistId),
    queryFn: () => getGist(gistId),
    enabled: !!gistId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a new gist
 */
export function useCreateGist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createGist,
    onSuccess: () => {
      // Invalidate all gist lists
      queryClient.invalidateQueries({ queryKey: gistKeys.lists() });
    },
  });
}

/**
 * Update an existing gist
 */
export function useUpdateGist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ gistId, request }: { gistId: string; request: UpdateGistRequest }) =>
      updateGist(gistId, request),
    onSuccess: (updatedGist) => {
      // Update the specific gist in cache
      queryClient.setQueryData(gistKeys.detail(updatedGist.id), updatedGist);
      // Invalidate all gist lists
      queryClient.invalidateQueries({ queryKey: gistKeys.lists() });
    },
  });
}

/**
 * Delete a gist
 */
export function useDeleteGist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteGist,
    onSuccess: (_, gistId) => {
      // Remove the gist from cache
      queryClient.removeQueries({ queryKey: gistKeys.detail(gistId) });
      // Invalidate all gist lists
      queryClient.invalidateQueries({ queryKey: gistKeys.lists() });
    },
  });
}

// ===== EXCALIDRAW SPECIFIC HOOKS =====

/**
 * Get all Excalidraw gists
 */
export function useExcalidrawGists(page = 1, perPage = 30) {
  const { data: gists, ...rest } = useGists(page, perPage);
  
  return {
    ...rest,
    data: gists ? findExcalidrawGists(gists) : undefined,
  };
}

/**
 * Get Excalidraw data from a gist
 */
export function useExcalidrawData(gistId: string, filename = 'drawing.excalidraw') {
  const { data: gist, ...rest } = useGist(gistId);
  
  return useQuery({
    queryKey: [...gistKeys.detail(gistId), 'excalidraw', filename],
    queryFn: async () => {
      if (!gist) return null;
      return extractExcalidrawData(gist, filename);
    },
    enabled: !!gist,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get Excalidraw metadata from a gist (synchronous)
 */
export function useExcalidrawMetadata(gistId: string, filename = 'drawing.excalidraw') {
  const { data: gist, ...rest } = useGist(gistId);
  
  return {
    ...rest,
    data: gist ? getExcalidrawMetadata(gist, filename) : undefined,
    gist,
  };
}

/**
 * Create a new Excalidraw gist
 */
export function useCreateExcalidrawGist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      drawingData,
      filename,
      description,
      isPublic,
    }: {
      drawingData: ExcalidrawData;
      filename?: string;
      description?: string;
      isPublic?: boolean;
    }) => createExcalidrawGist(drawingData, filename, description, isPublic),
    onSuccess: () => {
      // Invalidate all gist lists
      queryClient.invalidateQueries({ queryKey: gistKeys.lists() });
    },
  });
}

/**
 * Update an existing Excalidraw gist
 */
export function useUpdateExcalidrawGist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      gistId,
      drawingData,
      filename,
    }: {
      gistId: string;
      drawingData: ExcalidrawData;
      filename?: string;
    }) => updateExcalidrawGist(gistId, drawingData, filename),
    onSuccess: (updatedGist) => {
      // Update the specific gist in cache
      queryClient.setQueryData(gistKeys.detail(updatedGist.id), updatedGist);
      // Invalidate all gist lists
      queryClient.invalidateQueries({ queryKey: gistKeys.lists() });
    },
  });
}

// ===== CONVENIENCE HOOKS =====

/**
 * Get gists with search/filtering
 */
export function useSearchGists(searchTerm?: string) {
  const { data: gists, ...rest } = useGists();
  
  return {
    ...rest,
    data: gists?.filter(gist => 
      !searchTerm || 
      gist.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(gist.files).some(file => 
        file.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ),
  };
}

/**
 * Get recent gists (sorted by updated_at)
 */
export function useRecentGists(limit = 10) {
  const { data: gists, ...rest } = useGists();
  
  return {
    ...rest,
    data: gists?.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ).slice(0, limit),
  };
}
