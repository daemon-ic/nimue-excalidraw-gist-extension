import { ExcalidrawDrawingMetadata, ExcalidrawData } from "@/types/repository";
import { getDrawingContent } from "@/hooks/useRepository";
import browser from "webextension-polyfill";

export class LoadDrawingBgScript {
    static async run(drawing: ExcalidrawDrawingMetadata, owner: string): Promise<void> {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) throw new Error("No active tab found");

            // Get full drawing data
            const drawingWithData = await getDrawingContent(owner, drawing.filename);
            const drawingData = drawingWithData.drawingData;

            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: async (filename: string, drawingData: ExcalidrawData) => {
                    // BACKGROUND (WEB) CONTEXT
                    try {
                        localStorage.setItem('excalidraw', JSON.stringify(drawingData.elements));
                        localStorage.setItem('excalidraw-state', JSON.stringify(drawingData.appState || {}));
                        localStorage.setItem('version-files', JSON.stringify(drawingData.files || {}));
                        localStorage.setItem('version-dataState', JSON.stringify(drawingData.appState || {}));
                        localStorage.setItem('drawing-id', filename);

                        window.location.reload();
                    } catch (error) {
                        console.error('Failed to load or parse Excalidraw data:', error);
                    }
                },
                args: [drawing.filename, drawingData]
            });
        } catch (error) {
            console.error('Failed to load drawing:', error);
            throw error;
        }
    }
}
