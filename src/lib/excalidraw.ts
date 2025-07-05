import { ExcalidrawData } from "@/types/excalidraw";
import { Gist } from "@/types/gist";
import { createGist, updateGist, getGist } from "./gist";
import { getGithubTokenFn } from "./github";
import { ACTIONS } from "./config";
import browser from "webextension-polyfill";

export async function createExcalidrawGist(
    drawingData: ExcalidrawData,
    filename: string = 'drawing.excalidraw',
    description?: string,
    isPublic: boolean = false
  ): Promise<Gist> {
    return createGist({
      description: description || 'Excalidraw drawing',
      public: isPublic,
      files: {
        [filename]: {
          content: JSON.stringify(drawingData, null, 2),
        },
      },
    });
  }
  
  export async function updateExcalidrawGist(
    gistId: string,
    drawingData: ExcalidrawData,
    filename: string = 'drawing.excalidraw'
  ): Promise<Gist> {
    return updateGist(gistId, {
      files: {
        [filename]: {
          content: JSON.stringify(drawingData, null, 2),
        },
      },
    });
  }
  
  export async function extractExcalidrawData(gist: Gist): Promise<ExcalidrawData | null> {
    const filename = Object.keys(gist.files)[0];
    const file = gist.files[filename];
    
    if (!file) {
      return null;
    }
  
  
    let content: string;
    console.log(file);
  
    // If content is already available, use it
    if (file.content) {
      content = file.content;
    } 
    // Otherwise, fetch the content from the raw URL
    else if (file.raw_url) {
      try {
        const token = await getGithubTokenFn();
        const response = await fetch(file.raw_url, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file content: ${response.status}`);
        }
        
        content = await response.text();
      } catch (error) {
        console.error('Failed to fetch file content:', error);
        return null;
      }
    } else {
      return null;
    }
  
    try {
      return JSON.parse(content) as ExcalidrawData;
    } catch (error) {
      console.error('Failed to parse Excalidraw data:', error);
      return null;
    }
  }
  
  export function findExcalidrawGists(gists: Gist[]): Gist[] {
    return gists.filter(gist => 
      Object.values(gist.files).some(file => 
        file.filename?.endsWith('.excalidraw') || 
        file.filename?.endsWith('.excalidraw.json') ||
        file.type === 'application/json'
      )
    );
  }
  
  export function getExcalidrawMetadata(gist: Gist, filename: string = 'drawing.excalidraw'): {
    gistId: string;
    filename: string;
    description: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    owner: string;
    htmlUrl: string;
    fileSize: number;
    hasContent: boolean;
  } | null {
    const file = gist.files[filename];
    
    if (!file) {
      return null;
    }
  
    return {
      gistId: gist.id,
      filename: file.filename || filename,
      description: gist.description,
      isPublic: gist.public,
      createdAt: gist.created_at,
      updatedAt: gist.updated_at,
      owner: gist.owner.login,
      htmlUrl: gist.html_url,
      fileSize: file.size || 0,
      hasContent: !!file.content,
    };
  }
  
//   export async function loadDrawingContentScript(gist: Gist): Promise<void> {
//     try {
//       console.log("CONTENT SCRIPT: Loading drawing from gist", gist.id)
//       const drawingData = await extractExcalidrawData(gist);
  
//       if (!drawingData) {
//         throw new Error('No Excalidraw data found in gist');
//       }
  
//       localStorage.setItem('excalidraw', JSON.stringify(drawingData));
//       localStorage.setItem('excalidraw-state', JSON.stringify(drawingData.appState || {}));
//       localStorage.setItem('version-files', JSON.stringify(drawingData.files || {}));
//       localStorage.setItem('version-dataState', JSON.stringify(drawingData.appState || {}));
//       localStorage.setItem('drawing-id', gist.id);
  
//       window.location.reload();
//     } catch (error) {
//       console.error('Failed to load drawing:', error);
//       throw error;
//     }
//   }
  
  export async function loadDrawingBackgroundScript(gist: Gist): Promise<void> {
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

  export async function saveCurrentDrawingToGist(gistId: string): Promise<Gist> {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error("No active tab found");

      // Get current drawing data from the web page
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          try {
            const elements = localStorage.getItem('excalidraw');
            const appState = localStorage.getItem('excalidraw-state');
            const files = localStorage.getItem('version-files');
            const drawingId = localStorage.getItem('drawing-id');

            if (!elements || !appState) {
              throw new Error('No drawing data found in localStorage');
            }

            return {
              elements: JSON.parse(elements),
              appState: JSON.parse(appState),
              files: files ? JSON.parse(files) : {},
              drawingId: drawingId
            };
          } catch (error) {
            console.error('Failed to get drawing data from localStorage:', error);
            throw error;
          }
        }
      });

      const drawingData = result[0].result;
      
      // Create the complete Excalidraw data structure
      const excalidrawData: ExcalidrawData = {
        type: "excalidraw",
        version: 2,
        source: "https://excalidraw.com",
        elements: drawingData.elements,
        appState: drawingData.appState,
        files: drawingData.files
      };

      // Update the gist with the new drawing data
      const updatedGist = await updateExcalidrawGist(gistId, excalidrawData);
      
      return updatedGist;
    } catch (error) {
      console.error('Failed to save drawing to gist:', error);
      throw error;
    }
  }

  export async function saveDrawingBackgroundScript(gist: Gist): Promise<Gist> {
    try {
      console.log("BACKGROUND SCRIPT: Saving drawing to gist", gist.id);
      
      // Send message to background script to update the gist
      const response = await browser.runtime.sendMessage({
        action: ACTIONS.UPDATE_GIST,
        payload: { gistId: gist.id }
      });

      if (response.success) {
        console.log("Drawing saved successfully:", response.gist);
        return response.gist;
      } else {
        throw new Error(response.error || 'Failed to save drawing');
      }
    } catch (error) {
      console.error('Failed to save drawing:', error);
      throw error;
    }
  }

  export async function createNewDrawingBackgroundScript(name: string): Promise<Gist> {
    try {
      console.log("BACKGROUND SCRIPT: Creating new drawing", name);
      
      // Send message to background script to create new gist
      const response = await browser.runtime.sendMessage({
        action: ACTIONS.CREATE_GIST,
        payload: { name }
      });

      if (response.success) {
        console.log("New drawing created successfully:", response.gist);
        return response.gist;
      } else {
        throw new Error(response.error || 'Failed to create new drawing');
      }
    } catch (error) {
      console.error('Failed to create new drawing:', error);
      throw error;
    }
  }

  export async function copyDrawingBackgroundScript(gist: Gist, newName: string): Promise<Gist> {
    try {
      console.log("BACKGROUND SCRIPT: Copying drawing", gist.id, "as", newName);
      
      // Send message to background script to copy gist
      const response = await browser.runtime.sendMessage({
        action: ACTIONS.COPY_GIST,
        payload: { gistId: gist.id, newName }
      });

      if (response.success) {
        console.log("Drawing copied successfully:", response.gist);
        return response.gist;
      } else {
        throw new Error(response.error || 'Failed to copy drawing');
      }
    } catch (error) {
      console.error('Failed to copy drawing:', error);
      throw error;
    }
  }