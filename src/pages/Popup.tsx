import React, { useState } from 'react'
import { useCurrentTab } from '../hooks/useStorage'
import Header from '../components/Header'
import ConnectModal from '@/components/ConnectModal'
import { useAuthStatus } from '@/hooks/useGitHub'
import Gallery from '@/components/Gallery'
import Sidebar from '@/components/Sidebar'

export const Popup: React.FC = () => {
  const { data: currentTab, isLoading: tabLoading, error: tabError } = useCurrentTab()
  const { status, gists, gistsLoading } = useAuthStatus()
  console.log(gists)

  const isLoading = tabLoading || status === 'loading' || gistsLoading
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    <div className="extension-popup h-screen flex flex-col">
      {isModalOpen && <ConnectModal onClose={() => setIsModalOpen(false)} />}
      <Header status={status} onConnect={() => setIsModalOpen(true)} />
      
      {status === 'connected' && gists ? (
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-y-auto p-4">
            <Gallery gists={gists} />
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