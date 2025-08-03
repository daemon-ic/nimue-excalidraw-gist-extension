// Content script is no longer needed for message passing
// We now use chrome.scripting.executeScript which directly executes code in the page context
// This file can be removed or kept minimal for future use

console.log('[Content] Content script loaded - using executeScript approach instead of message passing');