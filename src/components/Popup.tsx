import React from 'react'
import { useCount, useUpdateCount, useCurrentTab } from '../hooks/useStorage'

export const Popup: React.FC = () => {
  const { data: count = 0, isLoading: countLoading, error: countError } = useCount()
  const { data: currentTab, isLoading: tabLoading, error: tabError } = useCurrentTab()
  const updateCountMutation = useUpdateCount()

  const handleIncrement = () => {
    updateCountMutation.mutate(count + 1)
  }

  const handleReset = () => {
    updateCountMutation.mutate(0)
  }

  const isLoading = countLoading || tabLoading

  if (isLoading) {
    return (
      <div className="extension-popup p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (countError || tabError) {
    return (
      <div className="extension-popup p-4">
        <div className="text-center text-red-600">
          <p>Error loading extension data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="extension-popup p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Chrome Extension
          </h1>
          <p className="text-sm text-gray-600">
            Built with Vite + Tailwind + React Query
          </p>
        </div>

        {/* Counter Section */}
        <div className="extension-card">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Counter</h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Count:</span>
            <span className="text-2xl font-bold text-primary-600">{count}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleIncrement}
              disabled={updateCountMutation.isPending}
              className="extension-button flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateCountMutation.isPending ? 'Updating...' : 'Increment'}
            </button>
            <button
              onClick={handleReset}
              disabled={updateCountMutation.isPending}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Current URL Section */}
        {currentTab?.url && (
          <div className="extension-card">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Current Page</h2>
            <p className="text-sm text-gray-600 break-all">
              {currentTab.url}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Click the extension icon to open this popup</p>
        </div>
      </div>
    </div>
  )
} 