import { ExcalidrawData } from "@/types/excalidraw";

// ===== UTILITY FUNCTIONS =====

// The "Could not establish connection. Receiving end does not exist" error occurs when:
// 1. The content script is not loaded yet
// 2. The content script is not running on the current page
// 3. There's a timing issue between when the message is sent and when the content script is ready
//
// Reliable approach using chrome.scripting.executeScript
// This bypasses content script loading issues by directly executing code in the page context
async function executeContentScript(action: string, payload: any): Promise<ExcalidrawData> {
    console.log('executeContentScript', action, payload)

    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tabId = tabs[0].id;

            if (!tabId) {
                reject(new Error('[Content] No active tab found'));
                return;
            }

            // Check if we're on the right page
            const tab = tabs[0];
            if (!tab.url?.includes('excalidraw.com')) {
                reject(new Error('[Content] Not on Excalidraw page'));
                return;
            }

            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: (actionData, payloadData) => {
                        // This function runs in the context of the web page
                        try {
                            const elements = localStorage.getItem('excalidraw');
                            const appState = localStorage.getItem('excalidraw-state');
                            const files = localStorage.getItem('version-files');
                            const drawingId = localStorage.getItem('drawing-id');

                            if (!elements || !appState) {
                                throw new Error('[Content] No drawing data found in localStorage');
                            }

                            // Parse the data safely
                            const parsedElements = JSON.parse(elements);
                            const parsedAppState = JSON.parse(appState);
                            const parsedFiles = files ? JSON.parse(files) : {};

                            return {
                                elements: parsedElements,
                                appState: parsedAppState,
                                files: parsedFiles,
                                drawingId: drawingId
                            };
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            throw new Error(`[Content] Error parsing localStorage data: ${errorMessage}`);
                        }
                    },
                    args: [action, payload]
                });

                if (results && results[0] && results[0].result) {
                    const result = results[0].result;
                    
                    // Validate the result structure
                    if (!result.elements || !result.appState) {
                        reject(new Error('[Content] Invalid data structure returned from page'));
                        return;
                    }

                    const excalidrawData: ExcalidrawData = {
                        type: "excalidraw",
                        version: 2,
                        source: "https://excalidraw.com",
                        elements: result.elements || [],
                        appState: result.appState || {},
                        files: result.files || {}
                    };
                    resolve(excalidrawData);
                } else {
                    reject(new Error('[Content] No result from content script execution'));
                }
            } catch (error) {
                console.error('[Content] executeScript error:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                reject(new Error(`[Content] Failed to execute script: ${errorMessage}`));
            }
        });
    });
}






export class CreateGistContentMsg {
    static readonly action = "create_gist";

    static async send(name: string): Promise<ExcalidrawData> {
        console.log('1 send', name)
        
        const response = await executeContentScript(this.action, { name });
        console.log('2 response from executeContentScript', response);
        return response;
    }


}




