import { Gist } from "@/types/gist";
import { getGist, useUpdateGist } from "@/hooks/useGist";
import { ExcalidrawData } from "@/types/excalidraw";
import browser from "webextension-polyfill";

export class LoadDrawingBgScript {
    static async run(gist: Gist): Promise<void> {
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
            throw error;
        }
    }
}
