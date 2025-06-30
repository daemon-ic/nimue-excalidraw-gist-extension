import React from 'react'
import { useSettings, useUpdateSettings } from '../hooks/useStorage'

export const Options: React.FC = () => {
  const { data: settings, isLoading, error } = useSettings()
  const updateSettingsMutation = useUpdateSettings()

  const handleSettingChange = (key: string, value: any) => {
    if (settings) {
      const newSettings = { ...settings, [key]: value }
      updateSettingsMutation.mutate(newSettings)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading settings</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Extension Settings
          </h1>

          <div className="space-y-6">
            {/* Notifications Setting */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Enable Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Show notifications when the extension performs actions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                  disabled={updateSettingsMutation.isPending}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 disabled:opacity-50"></div>
              </label>
            </div>

            {/* Auto Save Setting */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Auto Save
                </h3>
                <p className="text-sm text-gray-600">
                  Automatically save data when changes are made
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  disabled={updateSettingsMutation.isPending}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 disabled:opacity-50"></div>
              </label>
            </div>

            {/* Theme Setting */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Theme
              </h3>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                disabled={updateSettingsMutation.isPending}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Save Status */}
            {updateSettingsMutation.isPending && (
              <div className="text-center text-blue-600">
                <p>Saving settings...</p>
              </div>
            )}

            {updateSettingsMutation.isSuccess && (
              <div className="text-center text-green-600">
                <p>Settings saved successfully!</p>
              </div>
            )}

            {updateSettingsMutation.isError && (
              <div className="text-center text-red-600">
                <p>Error saving settings. Please try again.</p>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => window.close()}
                className="w-full extension-button"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 