import { Gist } from "@/types/gist";
import { getExcalidrawMetadata, loadDrawingFromGist } from "@/lib/gist";
import { sleep } from "@/lib/utils";
import browser from "webextension-polyfill";

type CleanGist = {
    title: string;
    updatedAt: string;
    gistId: string;
    htmlUrl: string;
    fileSize: number;
    hasContent: boolean;
    filename: string;
}

function Drawing({ gist }: { gist: Gist }) {
    const handleClick = async () => {
        try {
            console.log('Loading drawing:', gist.description);
            
            // Get the active tab
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.id) {
                throw new Error('No active tab found');
            }

            // Send message to content script in the active tab
            await browser.tabs.sendMessage(tab.id, {
                action: 'loadDrawing',
                title: gist.description,
                gistId: gist.id
            });

            console.log('Message sent successfully');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to load drawing. Make sure you are on an Excalidraw page.');
        }
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleClick}
        >
            <h2 className="text-sm font-semibold text-gray-700 mb-2 truncate">{gist.description}</h2>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                <span>{new Date(gist.updated_at).toLocaleDateString()}</span>
                {/* <span>{gist.files['drawing.excalidraw'].size > 0 ? `${(gist.files['drawing.excalidraw'].size / 1024).toFixed(1)}KB` : 'Unknown'}</span> */}
            </div>
            <div className="flex space-x-2">
                <a
                    href={gist.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs"
                >
                    View
                </a>
                {/* {!gist.files['drawing.excalidraw'].content && (
                    <span className="text-orange-600 text-xs">Not cached</span>
                )} */}
            </div>
        </div>
    )
}

export default function Gallery({ gists }: { gists: Gist[] }) {
    // TODO: filter only excalidraw gists

    if (gists.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No Excalidraw drawings found</p>
            </div>
        );
    }

    return (
        <div className="gap-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
            {gists.filter(gist => Object.values(gist.files).some(file => file.filename?.endsWith('.excalidraw'))).map((gist) => (
                <Drawing key={gist.id} gist={gist} />
            ))}
        </div>
    )
}