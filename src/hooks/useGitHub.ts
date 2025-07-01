import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import browser from 'webextension-polyfill';
import { validateGitHubToken, type TokenValidationResult } from '@/lib/github';
import { useGists } from './useGist';
import { Gist } from '@/types/gist';

// ===== QUERY KEYS =====
export const githubKeys = {
  all: ['github'] as const,
  token: () => [...githubKeys.all, 'token'] as const,
  validation: (token?: string) => [...githubKeys.all, 'validation', token] as const,
};

// ===== TOKEN MANAGEMENT =====

/**
 * Get stored GitHub token
 */
export function useGithubToken() {
  return useQuery({
    queryKey: githubKeys.token(),
    queryFn: async () => {
      const result = await browser.storage.local.get(['github_token']);
      return result.github_token || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Set GitHub token
 */
export function useSetGithubToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newToken: string) => {
      await browser.storage.local.set({ github_token: newToken });
      return newToken;
    },
    onSuccess: (newToken) => {
      queryClient.setQueryData(githubKeys.token(), newToken);
      queryClient.invalidateQueries({ queryKey: githubKeys.validation() });
    },
  });
}

// ===== TOKEN VALIDATION =====

/**
 * Validate the stored GitHub token
 */
export function useValidateStoredToken() {
  const { data: storedToken } = useGithubToken();
  
  return useQuery({
    queryKey: githubKeys.validation(storedToken || ''),
    queryFn: () => {
      if (!storedToken) {
        return Promise.resolve({
          isValid: false,
          error: 'No token stored'
        } as TokenValidationResult);
      }
      return validateGitHubToken(storedToken);
    },
    enabled: !!storedToken,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Test a token (for validation in forms)
 */
export function useTestToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: validateGitHubToken,
    onSuccess: (result, token) => {
      queryClient.setQueryData(githubKeys.validation(token), result);
    },
  });
}

// ===== CONVENIENCE HOOKS =====

export type AuthStatus = 
  | { status: 'loading'; user?: undefined; gists: Gist[]; gistsLoading: boolean; gistsError: Error | null }
  | { status: 'disconnected'; user?: undefined; gists: Gist[]; gistsLoading: boolean; gistsError: Error | null }
  | { status: 'connected'; user: { login: string; name?: string; email?: string }; gists: Gist[]; gistsLoading: boolean; gistsError: Error | null };

/**
 * Get authentication status with gists
 */
export function useAuthStatus(): AuthStatus {
  const { data: storedToken, isLoading: tokenLoading } = useGithubToken();
  const { data: validation, isLoading: validationLoading } = useValidateStoredToken();
  
  // Only fetch gists if we have a valid token
  const shouldFetchGists = !!storedToken && validation?.isValid;
  const { data: gists, isLoading: gistsLoading, error: gistsError } = useGists(1, 100, {
    enabled: shouldFetchGists,
  });

  const isLoading = tokenLoading || validationLoading;
  
  if (isLoading) {
    return { 
      status: 'loading', 
      gists: [], 
      gistsLoading: true, 
      gistsError: null 
    };
  }
  
  if (!storedToken || !validation?.isValid) {
    return { 
      status: 'disconnected', 
      gists: [], 
      gistsLoading: false, 
      gistsError: null 
    };
  }
  
  return { 
    status: 'connected', 
    user: validation.user!,
    gists: gists || [], 
    gistsLoading: gistsLoading, 
    gistsError: gistsError || null 
  };
}

// // ===== QUERY KEYS =====
// export const tokenKeys = {
//   all: ['github'] as const,
//   stored: () => [...tokenKeys.all, 'stored'] as const,
//   validation: (token?: string) => [...tokenKeys.all, 'validation', token] as const,
// };

// // ===== TOKEN MANAGEMENT HOOKS =====

// export function useStoredToken() {
//   return useQuery({
//     queryKey: tokenKeys.stored(),
//     queryFn: getStoredToken,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// }

// export function useSaveToken() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: saveToken,
//     onSuccess: (_, token) => {
//       // Invalidate stored token query
//       queryClient.invalidateQueries({ queryKey: tokenKeys.stored() });
//       // Invalidate validation query for this token
//       queryClient.invalidateQueries({ queryKey: tokenKeys.validation(token) });
//     },
//   });
// }

// // ===== TOKEN VALIDATION HOOKS =====

// export function useValidateToken(token: string) {
//   return useQuery({
//     queryKey: tokenKeys.validation(token),
//     queryFn: () => validateGitHubToken(token),
//     enabled: !!token,
//     retry: false, // Don't retry on validation failures
//     staleTime: 10 * 60 * 1000, // 10 minutes
//   });
// }

// export function useValidateStoredToken() {
//   const { data: storedToken } = useStoredToken();
  
//   return useQuery({
//     queryKey: tokenKeys.validation(storedToken || ''),
//     queryFn: () => {
//       if (!storedToken) {
//         return Promise.resolve({
//           isValid: false,
//           error: 'No token stored'
//         } as TokenValidationResult);
//       }
//       return validateGitHubToken(storedToken);
//     },
//     enabled: !!storedToken,
//     retry: false,
//     staleTime: 10 * 60 * 1000, // 10 minutes
//   });
// }

// export function useTestToken() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: validateGitHubToken,
//     onSuccess: (result, token) => {
//       queryClient.setQueryData(tokenKeys.validation(token), result);
//     },
//   });
// }

// // ===== CONVENIENCE HOOKS =====

// export function useHasValidToken() {
//   const { data: storedToken } = useStoredToken();
//   const { data: validation } = useValidateStoredToken();
  
//   return {
//     hasToken: !!storedToken,
//     isValid: validation?.isValid || false,
//     isLoading: !validation,
//     user: validation?.user,
//     error: validation?.error,
//   };
// }

// export function useCurrentUser() {
//   const { data: validation } = useValidateStoredToken();
  
//   return {
//     user: validation?.user,
//     isValid: validation?.isValid || false,
//     isLoading: !validation,
//     error: validation?.error,
//   };
// } 