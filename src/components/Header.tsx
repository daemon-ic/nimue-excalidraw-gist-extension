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

export default function Header({ status, onConnect }: { status: ConnectionStatus, onConnect: () => void }) {
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
            </div>
        </header>
    )
}