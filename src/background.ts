import browser from "webextension-polyfill";
import { ACTIONS } from "./lib/config";
import { saveCurrentDrawingToGist, createExcalidrawGist } from "./lib/excalidraw";

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case ACTIONS.SAVE_DRAWING:
      console.log("[Background] Received drawing data:", message.payload);
      browser.storage.local.set({
        [message.payload.id]: message.payload
      });
      break;
    
    case ACTIONS.UPDATE_GIST:
      console.log("[Background] Updating gist:", message.payload);
      saveCurrentDrawingToGist(message.payload.gistId)
        .then((updatedGist) => {
          console.log("[Background] Gist updated successfully:", updatedGist);
          sendResponse({ success: true, gist: updatedGist });
        })
        .catch((error) => {
          console.error("[Background] Failed to update gist:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true; // Indicates we will send a response asynchronously
      break;

    case ACTIONS.CREATE_GIST:
      console.log("[Background] Creating new gist:", message.payload);
      createExcalidrawGist(
        {
          type: "excalidraw",
          version: 2,
          source: "https://excalidraw.com",
          elements: [],
          appState: {
            gridSize: 20,
            gridStep: 1,
            gridModeEnabled: false,
            viewBackgroundColor: "#ffffff",
            lockedMultiSelections: {}
          },
          files: {}
        },
        'drawing.excalidraw',
        message.payload.name,
        false
      )
        .then((newGist) => {
          console.log("[Background] New gist created successfully:", newGist);
          sendResponse({ success: true, gist: newGist });
        })
        .catch((error) => {
          console.error("[Background] Failed to create gist:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
      break;

    case ACTIONS.COPY_GIST:
      console.log("[Background] Copying gist:", message.payload);
      
      // First get the current drawing data from the web page
      browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
          if (!tabs[0]?.id) {
            throw new Error("No active tab found");
          }
          
          return chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              try {
                const elements = localStorage.getItem('excalidraw');
                const appState = localStorage.getItem('excalidraw-state');
                const files = localStorage.getItem('version-files');

                if (!elements || !appState) {
                  throw new Error('No drawing data found in localStorage');
                }

                return {
                  elements: JSON.parse(elements),
                  appState: JSON.parse(appState),
                  files: files ? JSON.parse(files) : {}
                };
              } catch (error) {
                console.error('Failed to get drawing data from localStorage:', error);
                throw error;
              }
            }
          });
        })
        .then((result) => {
          const drawingData = result[0].result;
          
          // Create the complete Excalidraw data structure
          const excalidrawData = {
            type: "excalidraw" as const,
            version: 2,
            source: "https://excalidraw.com",
            elements: drawingData.elements,
            appState: drawingData.appState,
            files: drawingData.files
          };

          // Create new gist with the copied data
          return createExcalidrawGist(
            excalidrawData,
            'drawing.excalidraw',
            message.payload.newName,
            false
          );
        })
        .then((newGist) => {
          console.log("[Background] Gist copied successfully:", newGist);
          sendResponse({ success: true, gist: newGist });
        })
        .catch((error) => {
          console.error("[Background] Failed to copy gist:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        });
      return true;
      break;
  }
});