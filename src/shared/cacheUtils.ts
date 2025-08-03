// import { QueryClient } from '@tanstack/react-query';
// import { GIST_KEYS, GITHUB_KEYS } from './config';

// /**
//  * Centralized cache invalidation utilities
//  * Provides consistent patterns for cache management across the app
//  */

// export const cacheUtils = {
//   /**
//    * Invalidate all gist-related queries and force fresh data
//    */
//   invalidateAllGists: (queryClient: QueryClient) => {
//     queryClient.invalidateQueries({ queryKey: GIST_KEYS.LIST });
//     // Force immediate refetch for fresh data
//     queryClient.refetchQueries({ queryKey: GIST_KEYS.LIST });
//   },

//   /**
//    * Invalidate a specific gist detail
//    */
//   invalidateGistDetail: (queryClient: QueryClient, gistId: string) => {
//     queryClient.invalidateQueries({ queryKey: GIST_KEYS.DETAIL(gistId) });
//   },

//   /**
//    * Update gist list and set specific gist detail
//    * Forces fresh data by invalidating and refetching
//    */
//   updateGistData: (queryClient: QueryClient, gist: any) => {
//     // Invalidate and force refetch for fresh data
//     queryClient.invalidateQueries({ queryKey: GIST_KEYS.LIST });
//     queryClient.refetchQueries({ queryKey: GIST_KEYS.LIST });
//     // Set the new gist data in cache for immediate access
//     queryClient.setQueryData(GIST_KEYS.DETAIL(gist.id), gist);
//   },

//   /**
//    * Invalidate GitHub validation
//    */
//   invalidateGithubValidation: (queryClient: QueryClient) => {
//     queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.VALIDATION });
//   },

//   /**
//    * Update GitHub token and invalidate validation
//    */
//   updateGithubToken: (queryClient: QueryClient, token: string) => {
//     queryClient.setQueryData(GITHUB_KEYS.TOKEN, token);
//     queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.VALIDATION });
//   },
// }; 