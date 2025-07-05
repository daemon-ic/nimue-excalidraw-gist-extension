import browser from "webextension-polyfill";
import { ACTIONS } from "./lib/config";

browser.runtime.onMessage.addListener((message, sender) => {
  switch (message.action) {
    case ACTIONS.SAVE_DRAWING:
      console.log("[Background] Received drawing data:", message.payload);
      browser.storage.local.set({
        [message.payload.id]: message.payload
      });
      break;
  }
});