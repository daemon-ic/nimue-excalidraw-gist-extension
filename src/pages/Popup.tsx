import React, { useState, useCallback, useMemo } from 'react'
import Header from '@/components/Header'
import ConnectModal from '@/components/ConnectModal'
import Gallery from '@/components/Gallery'
import Sidebar from '@/components/Sidebar'
import { CHROME_KEYS } from '@/services/config'
import { useGithubToken, useCurrentGithubValidation } from '@/hooks/useGithub'
import { useQuery } from '@tanstack/react-query'
import { ConnectionStatus } from '@/types/common'
import { Gist } from '@/types/gist'
import { getCurrentTab } from '@/services/chrome'
import { useGetGists } from '@/hooks/useGist'


type AuthStatus = {
  status: ConnectionStatus
  gists: Gist[]
  isGistsLoading: boolean
  gistsError: Error | null
}

export const Popup: React.FC = () => {


  const { data: currentTab, isLoading: tabLoading, error: tabError } = useQuery({
    queryKey: CHROME_KEYS.CURRENT_TAB,
    queryFn: getCurrentTab,
  })

  const { githubToken, isGettingGithubToken } = useGithubToken();
  const { currentValidation, isLoadingCurrentValidation } = useCurrentGithubValidation();
  const { gists, isGistsLoading, gistsError, refetchGists } = useGetGists(
    githubToken,
    currentValidation,
  );

  const authStatus = useMemo((): AuthStatus => {
    if (isGettingGithubToken || isLoadingCurrentValidation || isGistsLoading) {
      return {
        status: 'loading',
        gists: [],
        isGistsLoading: true,
        gistsError: null
      };
    }

    if (!githubToken || !currentValidation?.isValid) {
      return {
        status: 'disconnected',
        gists: [],
        isGistsLoading: false,
        gistsError: null
      };
    }

    return {
      status: 'connected',
      gists: gists || [],
      isGistsLoading: isGistsLoading,
      gistsError: gistsError || null
    };
  }, [
    githubToken,
    currentValidation,
    gists,
    isGettingGithubToken,
    isLoadingCurrentValidation,
    isGistsLoading,
    gistsError
  ]);

  const { status, gists: authGists, isGistsLoading: authGistsLoading } = authStatus;
  console.log("getting gists after auth status", authGists)

  const isLoading = tabLoading || status === 'loading' || authGistsLoading || isGistsLoading
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, []);

  const handleConnect = useCallback(() => {
    setIsModalOpen(true)
  }, []);

  const handleRefresh = useCallback(() => {
    refetchGists();
  }, []);

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
      <Header status={status} onConnect={handleConnect} onRefresh={handleRefresh} />

      {status === 'connected' && authGists ? (
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-y-auto p-4">
            <Gallery gists={authGists} />
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