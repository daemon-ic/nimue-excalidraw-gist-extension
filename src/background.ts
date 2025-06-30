import browser from 'webextension-polyfill'

// Handle extension installation
browser.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason)
  
  // Set default settings on installation
  if (details.reason === 'install') {
    browser.storage.sync.set({
      settings: {
        enableNotifications: true,
        autoSave: false,
        theme: 'light'
      }
    })
  }
})

// Handle messages from content scripts and popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from:', sender)
  
  switch (message.action) {
    case 'getData':
      // Handle data retrieval
      sendResponse({ success: true, data: 'Some data' })
      break
      
    case 'saveData':
      // Handle data saving
      browser.storage.local.set({ data: message.data })
      sendResponse({ success: true })
      break
      
    case 'showNotification':
      // Show notification if enabled
      browser.storage.sync.get(['settings']).then((result) => {
        if (result.settings?.enableNotifications) {
          browser.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icon-48.png',
            title: 'Chrome Extension',
            message: message.message || 'Action completed successfully!'
          })
        }
      })
      sendResponse({ success: true })
      break
      
    default:
      sendResponse({ success: false, error: 'Unknown action' })
  }
  
  // Return true to indicate async response
  return true
})

// Handle tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url)
    
    // You can inject content scripts or perform other actions here
    if (tab.url.startsWith('http')) {
      // Example: Inject content script on specific sites
      // browser.scripting.executeScript({
      //   target: { tabId },
      //   files: ['js/content.js']
      // })
    }
  }
})

// Handle extension icon click
browser.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.id)
  
  // You can perform actions when the extension icon is clicked
  // For example, open a popup or execute a script
}) 