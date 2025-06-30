import { QueryClient } from '@tanstack/react-query'

// Create a query client with Chrome extension specific configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Chrome extensions have limited memory, so we want to be conservative
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1, // Only retry once for extension context
      refetchOnWindowFocus: false, // Don't refetch when popup reopens
      refetchOnReconnect: false, // Don't refetch on reconnect
    },
    mutations: {
      retry: 1, // Only retry once for mutations
    },
  },
})

// Custom error handler for Chrome extension context
export const handleQueryError = (error: unknown) => {
  console.error('Query error:', error)
  
  // You can add extension-specific error handling here
  // For example, show notifications or log to storage
  if (error instanceof Error) {
    console.error('Error message:', error.message)
  }
} 