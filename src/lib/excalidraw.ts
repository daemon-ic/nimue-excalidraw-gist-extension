import { ExcalidrawData } from "@/types/excalidraw";
import { Gist } from "@/types/gist";
import { createGist, updateGist } from "./gist";
import { getGithubTokenFn } from "./github";
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
  
//   export async function loadDrawingBackgroundScript(gist: Gist): Promise<void> {
//     console.log("BACKGROUND SCRIPT: Loading drawing from gist", gist.id)

//     const drawingData = await extractExcalidrawData(gist);

//     if (!drawingData) {
//       throw new Error('No Excalidraw data found in gist');
//     }

//     localStorage.setItem('excalidraw', JSON.stringify(drawingData));
//       localStorage.setItem('excalidraw-state', JSON.stringify(drawingData.appState || {}));
//       localStorage.setItem('version-files', JSON.stringify(drawingData.files || {}));
//       localStorage.setItem('version-dataState', JSON.stringify(drawingData.appState || {}));
//       localStorage.setItem('drawing-id', gist.id);

//     if (!drawingData) {
//       throw new Error('No Excalidraw data found in gist');
//     }
    

//   }