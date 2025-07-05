import React, { useState, useCallback, useMemo } from 'react'
import Header from '@/components/Header'
import ConnectModal from '@/components/ConnectModal'
import Gallery from '@/components/Gallery'
import Sidebar from '@/components/Sidebar'
import LoadingOverlay from '@/components/LoadingOverlay'
import { CHROME_KEYS, GIST_KEYS, GITHUB_KEYS } from '@/lib/config'
import { getGithubTokenFn, validateGithubTokenFn } from '@/lib/github'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllGists } from '@/lib/gist'
import { ConnectionStatus } from '@/types/common'
import { Gist } from '@/types/gist'
import { getCurrentTab } from '@/lib/chrome'


type AuthStatus = {
  status: ConnectionStatus
  gists: Gist[]
  gistsLoading: boolean
  gistsError: Error | null
}

export const Popup: React.FC = () => {
  const queryClient = useQueryClient();

  
  const { data: currentTab, isLoading: tabLoading, error: tabError } = useQuery({
    queryKey: CHROME_KEYS.CURRENT_TAB,
    queryFn: getCurrentTab,
  })
  
  // Move the queries to the component level
  const { data: githubToken, isLoading: githubTokenLoading } = useQuery({
    queryKey: GITHUB_KEYS.TOKEN,
    queryFn: getGithubTokenFn,
  });
  
  const { data: validation, isLoading: validationLoading } = useQuery({
    queryKey: GITHUB_KEYS.VALIDATION,
    queryFn: () => validateGithubTokenFn(githubToken),
    enabled: !!githubToken, // Only run if we have a token
  });
  
  // Only fetch gists if we have a valid token
  const shouldFetchGists = !!githubToken && validation?.isValid;
 
  const { data: gists, isLoading: gistsLoading, error: gistsError, refetch: refetchGists } = useQuery({
    queryKey: GIST_KEYS.list({ page: 1, perPage: 100 }),
    queryFn: () => getAllGists(1, 100),
    enabled: shouldFetchGists,
  });

  // Memoize the auth status calculation
  const authStatus = useMemo((): AuthStatus => {
    if (githubTokenLoading || validationLoading || gistsLoading) {
      return { 
        status: 'loading', 
        gists: [], 
        gistsLoading: true, 
        gistsError: null 
      };
    }
    
    if (!githubToken || !validation?.isValid) {
      return { 
        status: 'disconnected', 
        gists: [], 
        gistsLoading: false, 
        gistsError: null 
      };
    }
    
    return { 
      status: 'connected', 
      gists: gists || [], 
      gistsLoading: gistsLoading, 
      gistsError: gistsError || null 
    };
  }, [githubToken, validation, gists, githubTokenLoading, validationLoading, gistsLoading, gistsError]);

  const { status, gists: authGists, gistsLoading: authGistsLoading } = authStatus;
  console.log("getting gists after auth status", authGists)

  const isLoading = tabLoading || status === 'loading' || authGistsLoading
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Memoize the modal close handler
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, []);

  // Memoize the connect handler
  const handleConnect = useCallback(() => {
    setIsModalOpen(true)
  }, []);

  // Memoize the refresh handler
  const handleRefresh = useCallback(() => {
    queryClient.refetchQueries({ queryKey: GIST_KEYS.list({ page: 1, perPage: 100 }) });
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