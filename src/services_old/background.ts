import browser from "webextension-polyfill";
import { Gist } from "@/types/gist";
import { createGistFn, updateGistFn } from "@/hooks/useGist";
import { getCurrentDrawingDataFromLocalStorage } from "./excalidraw";

// ===== TYPE DEFINITIONS =====

interface BaseMessage {
    action: string;
    payload: any;
}

interface BaseResponse {
    success: boolean;
    error?: string;
}

interface GistResponse extends BaseResponse {
    gist?: Gist;
}

// ===== UTILITY FUNCTIONS =====

async function sendBackgroundMessage<T>(action: string, payload: any): Promise<T> {
    try {
        const response = await browser.runtime.sendMessage({
            action,
            payload
        });
        
        console.log(`[Extension] Received response for ${action}:`, response);
        
        if (response?.success) {
            return response;
        } else {
            throw new Error(response?.error || 'Unknown error');
        }
    } catch (error) {
        console.error(`[Extension] Failed to send ${action}:`, error);
        throw error;
    }
}

export function executeBackgroundHandler(
    action: string,
    handler: (message: BaseMessage) => Promise<BaseResponse>,
    message: BaseMessage,
    sendResponse: (response: BaseResponse) => void
): boolean {
    console.log(`[Background] Processing ${action}:`, message.payload);
    
    handler(message)
        .then((response) => {
            console.log(`[Background] ${action} completed successfully:`, response);
            sendResponse(response);
        })
        .catch((error) => {
            console.error(`[Background] ${action} failed:`, error);
            sendResponse({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        });
    
    return true; // Indicates we will send a response asynchronously
}

// ===== MESSAGE IMPLEMENTATIONS =====

// export class SaveDrawingMsg {
//     static readonly action = "save_drawing";
    
//     static async send(gist: Gist): Promise<Gist> {
//         const response = await sendBackgroundMessage<GistResponse>(this.action, { gistId: gist.id });
//         return response.gist!;
//     }
    
//     static async backgroundHandler(message: BaseMessage): Promise<GistResponse> {
        
//         const gist = { id: message.payload.gistId } as Gist;
//         return { success: true, gist };
//     }
// }

export class UpdateGistMsg {
    static readonly action = "update_gist";
    
    static async send(gist: Gist): Promise<Gist> {
        const response = await sendBackgroundMessage<GistResponse>(this.action, { gistId: gist.id });
        return response.gist!;
    }
    
    static async backgroundHandler(message: BaseMessage): Promise<GistResponse> {
        try {
            const excalidrawData = await getCurrentDrawingDataFromLocalStorage();
            // cant use react query in background scripts
            const updatedGist = await updateGistFn(message.payload.gistId, {
                files: {
                    'drawing.excalidraw': {
                        content: JSON.stringify(excalidrawData, null, 2)
                    }
                }
            });
            
            return { success: true, gist: updatedGist };
        } catch (error) {
            console.error("[Background] Failed to update gist:", error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            };
        }
    }
}



export class CopyGistMsg {
    static readonly action = "copy_gist";
    
    static async send(gist: Gist, newName: string): Promise<Gist> {
        const response = await sendBackgroundMessage<GistResponse>(this.action, { gistId: gist.id, newName });
        return response.gist!;
    }
    
    static async backgroundHandler(message: BaseMessage): Promise<GistResponse> {
        // cant use react query in background scripts
        const excalidrawData = await getCurrentDrawingDataFromLocalStorage();
        const newGist = await createGistFn({
            description: message?.payload?.newName || 'Excalidraw drawing',
            public: false,
            files: {
                'drawing.excalidraw': {
                    content: JSON.stringify(excalidrawData, null, 2)
                }
            }
        });
        
        return { success: true, gist: newGist };
    }
}

// ===== MESSAGE REGISTRY =====

export const MESSAGE_HANDLERS = {
    [UpdateGistMsg.action]: UpdateGistMsg,
    [CopyGistMsg.action]: CopyGistMsg,
} as const;


