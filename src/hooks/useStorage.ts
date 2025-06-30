import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import browser from 'webextension-polyfill'

// Query keys for React Query
export const storageKeys = {
  count: ['storage', 'count'] as const,
  settings: ['storage', 'settings'] as const,
  currentTab: ['storage', 'currentTab'] as const,
}

// Hook for getting count from local storage
export const useCount = () => {
  return useQuery({
    queryKey: storageKeys.count,
    queryFn: async () => {
      const result = await browser.storage.local.get(['count'])
      return result.count || 0
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook for updating count
export const useUpdateCount = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newCount: number) => {
      await browser.storage.local.set({ count: newCount })
      return newCount
    },
    onSuccess: (newCount) => {
      // Update the cache immediately
      queryClient.setQueryData(storageKeys.count, newCount)
    },
  })
}

// Hook for getting settings from sync storage
export const useSettings = () => {
  return useQuery({
    queryKey: storageKeys.settings,
    queryFn: async () => {
      const result = await browser.storage.sync.get(['settings'])
      return result.settings || {
        enableNotifications: true,
        autoSave: false,
        theme: 'light'
      }
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Hook for updating settings
export const useUpdateSettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (settings: any) => {
      await browser.storage.sync.set({ settings })
      return settings
    },
    onSuccess: (settings) => {
      // Update the cache immediately
      queryClient.setQueryData(storageKeys.settings, settings)
    },
  })
}

// Hook for getting current tab info
export const useCurrentTab = () => {
  return useQuery({
    queryKey: storageKeys.currentTab,
    queryFn: async () => {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      return tabs[0] || null
    },
    staleTime: 10 * 1000, // 10 seconds
  })
}

// Hook for sending messages to background script
export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (message: any) => {
      return await browser.runtime.sendMessage(message)
    },
  })
} 