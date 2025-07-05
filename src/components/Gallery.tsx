import { Gist } from "@/types/gist";
import browser from "webextension-polyfill";
import { ExcalidrawData } from "@/types/excalidraw";
import { getGist } from "@/lib/gist";

function Drawing({ gist, onClick }: { gist: Gist, onClick: (gist: Gist) => void }) {
    return (
        <div
            className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onClick(gist)}
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
            </div>
        </div>
    )
}

export default function Gallery({ gists }: { gists: Gist[] }) {
    async function handleLoadDrawing(gist: Gist) {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) throw new Error("No active tab found");

            const gistFiles = await getGist(gist.id);
            const filename = Object.keys(gistFiles.files)[0];
            const file = gistFiles.files[filename];
            const content = file.content;
            if (!content) throw new Error("No content in gist file");

            const drawingData = JSON.parse(content) as ExcalidrawData;


            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: async (gistId: string, drawingData: ExcalidrawData) => {
                    // BACKGROUND (WEB) CONTEXT
                    try {
                        localStorage.setItem('excalidraw', JSON.stringify(drawingData.elements));
                        localStorage.setItem('excalidraw-state', JSON.stringify(drawingData.appState || {}));
                        localStorage.setItem('version-files', JSON.stringify(drawingData.files || {}));
                        localStorage.setItem('version-dataState', JSON.stringify(drawingData.appState || {}));
                        localStorage.setItem('drawing-id', gistId);

                        window.location.reload();
                    } catch (error) {
                        console.error('Failed to load or parse Excalidraw data:', error);
                    }
                },
                args: [gist.id, drawingData]
            });
        } catch (error) {
            console.error('Failed to load drawing:', error);
            alert('Failed to load drawing. Make sure you are on an Excalidraw page.');
        }
    }

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
                <Drawing key={gist.id} gist={gist} onClick={handleLoadDrawing} />
            ))}
        </div>
    )
}