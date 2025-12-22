import React, { useState, useCallback, useMemo } from 'react'
import Header from '@/components/Header'
import ConnectModal from '@/components/ConnectModal'
import Gallery from '@/components/Gallery'
import Sidebar from '@/components/Sidebar'
import { CHROME_KEYS, REPO_KEYS } from '@/shared/config'
import { useGithubToken, useCurrentGithubValidation } from '@/hooks/useGithub'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentTab } from '@/services/extension/chrome'

export const Popup: React.FC = () => {
  const queryClient = useQueryClient();
  const { isLoading: tabLoading, error: tabError } = useQuery({
    queryKey: CHROME_KEYS.CURRENT_TAB,
    queryFn: getCurrentTab,
  })

  const { githubToken, isGettingGithubToken } = useGithubToken();
  const { currentValidation, isLoadingCurrentValidation } = useCurrentGithubValidation();

  const connectionStatus = useMemo(() => {
    if (isGettingGithubToken || isLoadingCurrentValidation) {
      return 'loading';
    }
    if (!githubToken || !currentValidation?.isValid) {
      return 'disconnected';
    }
    return 'connected';
  }, [isGettingGithubToken, isLoadingCurrentValidation]);

  const isLoading = tabLoading;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, []);

  const handleConnect = useCallback(() => {
    setIsModalOpen(true)
  }, []);

  const handleRefresh = useCallback(() => {
    // Force fresh data by invalidating and refetching drawings
    queryClient.invalidateQueries({ queryKey: REPO_KEYS.FILE_LIST });
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="extension-popup p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (tabError) {
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
    <div className="extension-popup h-screen flex flex-col relative">
      {isModalOpen && <ConnectModal onClose={handleCloseModal} />}
      <Header status={connectionStatus} onConnect={handleConnect} onRefresh={handleRefresh} />

      {connectionStatus === 'connected' ? (
        <div className="flex-1 flex overflow-hidden">
          <Sidebar onDrawingUpdated={handleRefresh} />
          <div className="flex-1 overflow-y-auto p-4">
            <Gallery />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-[--nimue-gray]">Please connect to your GitHub account to use the extension</p>
          </div>
        </div>
      )}
    </div>
  )
} 