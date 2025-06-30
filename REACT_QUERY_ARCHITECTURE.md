# React Query Architecture for Chrome Extension

This Chrome extension now uses **React Query (TanStack Query)** instead of `useEffect` for data fetching and state management. This provides better performance, caching, and error handling.

## Architecture Overview

### 1. **Query Client Configuration**
- Located in `src/lib/query-client.ts`
- Optimized for Chrome extension environment
- Conservative caching strategies to save memory
- Limited retries for extension context

### 2. **Custom Hooks**
- Located in `src/hooks/useStorage.ts`
- Encapsulate all Chrome extension API calls
- Provide consistent data fetching patterns
- Handle caching and optimistic updates

### 3. **Component Integration**
- Components use hooks instead of `useEffect`
- Automatic loading and error states
- Optimistic updates for better UX
- Built-in retry mechanisms

## Key Benefits

### 🚀 **Performance**
- **Caching**: Data is cached and reused across components
- **Background Updates**: Data refreshes in the background
- **Optimistic Updates**: UI updates immediately, syncs in background

### 🛡️ **Error Handling**
- **Automatic Retries**: Failed requests retry automatically
- **Error Boundaries**: Graceful error states with retry options
- **Loading States**: Clear loading indicators

### 🔄 **Data Synchronization**
- **Real-time Updates**: Data stays fresh across popup opens
- **Cross-tab Sync**: Settings sync across browser tabs
- **Background Sync**: Data updates even when popup is closed

## Custom Hooks

### `useCount()`
```typescript
const { data: count, isLoading, error } = useCount()
```
- Fetches count from `chrome.storage.local`
- Cached for 30 seconds
- Automatic background refresh

### `useUpdateCount()`
```typescript
const updateCount = useUpdateCount()
updateCount.mutate(newCount)
```
- Updates count in storage
- Optimistic UI updates
- Automatic cache invalidation

### `useSettings()`
```typescript
const { data: settings, isLoading, error } = useSettings()
```
- Fetches settings from `chrome.storage.sync`
- Cached for 1 minute
- Cross-device synchronization

### `useUpdateSettings()`
```typescript
const updateSettings = useUpdateSettings()
updateSettings.mutate(newSettings)
```
- Updates settings in sync storage
- Optimistic updates
- Cross-tab synchronization

### `useCurrentTab()`
```typescript
const { data: currentTab, isLoading, error } = useCurrentTab()
```
- Fetches current tab information
- Cached for 10 seconds
- Updates when tab changes

### `useSendMessage()`
```typescript
const sendMessage = useSendMessage()
sendMessage.mutate({ action: 'getData' })
```
- Sends messages to background script
- Handles responses and errors
- Automatic retry on failure

## Usage Examples

### Popup Component
```typescript
export const Popup: React.FC = () => {
  const { data: count = 0, isLoading, error } = useCount()
  const { data: currentTab } = useCurrentTab()
  const updateCount = useUpdateCount()

  const handleIncrement = () => {
    updateCount.mutate(count + 1)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage />

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  )
}
```

### Options Component
```typescript
export const Options: React.FC = () => {
  const { data: settings, isLoading, error } = useSettings()
  const updateSettings = useUpdateSettings()

  const handleSettingChange = (key: string, value: any) => {
    if (settings) {
      const newSettings = { ...settings, [key]: value }
      updateSettings.mutate(newSettings)
    }
  }

  return (
    <div>
      <input
        type="checkbox"
        checked={settings?.enableNotifications}
        onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
        disabled={updateSettings.isPending}
      />
      {updateSettings.isPending && <span>Saving...</span>}
    </div>
  )
}
```

## Configuration

### Query Client Settings
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // Data considered fresh for 30s
      gcTime: 5 * 60 * 1000, // Cache kept for 5 minutes
      retry: 1, // Only retry once
      refetchOnWindowFocus: false, // Don't refetch when popup opens
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
})
```

### Chrome Extension Optimizations
- **Conservative Caching**: Limited cache times to save memory
- **No Background Refetch**: Don't refetch when popup reopens
- **Limited Retries**: Only retry once to avoid spam
- **Optimistic Updates**: Immediate UI feedback

## Migration from useEffect

### Before (useEffect)
```typescript
const [count, setCount] = useState(0)
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const loadCount = async () => {
    try {
      const result = await browser.storage.local.get(['count'])
      setCount(result.count || 0)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  loadCount()
}, [])
```

### After (React Query)
```typescript
const { data: count = 0, isLoading, error } = useCount()
```

## Benefits Summary

1. **Less Code**: No manual loading/error state management
2. **Better UX**: Optimistic updates and background sync
3. **Automatic Caching**: Data persists across popup opens
4. **Error Recovery**: Built-in retry and error handling
5. **Performance**: Reduced API calls through caching
6. **Type Safety**: Full TypeScript support
7. **DevTools**: React Query DevTools for debugging

## Installation

The React Query dependency is already included in `package.json`:

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.9"
  }
}
```

Run `pnpm install` to install the dependency. 