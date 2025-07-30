import browser from "webextension-polyfill";
import { MESSAGE_HANDLERS, executeBackgroundHandler } from "./services/background";

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const HandlerClass = MESSAGE_HANDLERS[message.action as keyof typeof MESSAGE_HANDLERS];
  
  if (HandlerClass) {
    executeBackgroundHandler(message.action, HandlerClass.backgroundHandler, message, sendResponse);
  } else {
    console.error(`[Background] Unknown message action: ${message.action}`);
    sendResponse({ success: false, error: `Unknown action: ${message.action}` });
  }
});