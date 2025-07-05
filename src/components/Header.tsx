import { ConnectionStatus } from "../types/common"
import Button from "./Button"


const CONNECTION_STATUS: Record<ConnectionStatus, { label: string, color: string }> = {
    "connected": {
        "label": "Connected",
        "color": "bg-green-500"
    },
    "disconnected": {
        "label": "Not Connected",
        "color": "bg-red-500"
    },
    "loading": {
        "label": "Loading...",
        "color": "bg-gray-500"
    }
}

export default function Header({ 
    status, 
    onConnect, 
    onRefresh 
}: { 
    status: ConnectionStatus, 
    onConnect: () => void,
    onRefresh?: () => void 
}) {
    return (
        <header className="bg-white p-4 flex justify-between items-center border-b border-[--excali-gray]">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-[--excali-purple]">Nimue</h1>
                <div className="flex items-center">
                    <div id="connection-status" className={`w-2 h-2 rounded-full mr-2 ${CONNECTION_STATUS[status].color}`} />
                    <p className="text-xs text-[--nimue-dark-gray]">{CONNECTION_STATUS[status].label}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={onConnect}>Connect</Button>
                {status === 'connected' && onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="p-2 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        title="Refresh drawings"
                    >
                        <svg 
                            className="w-4 h-4 text-gray-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                            />
                        </svg>
                    </button>
                )}
            </div>
        </header>
    )
}