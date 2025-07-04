import browser from 'webextension-polyfill'

// Content script that runs on web pages
console.log('Chrome Extension Content Script Loaded')

// Example: Add a floating button to the page
const addFloatingButton = () => {
  // Check if button already exists
  if (document.getElementById('chrome-extension-floating-btn')) {
    return
  }

  const button = document.createElement('button')
  button.id = 'chrome-extension-floating-btn'
  button.innerHTML = '🚀'
  button.title = 'Chrome Extension'
  
  // Style the button
  Object.assign(button.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    zIndex: '10000',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  })

  // Add hover effects
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)'
    button.style.backgroundColor = '#2563eb'
  })

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)'
    button.style.backgroundColor = '#3b82f6'
  })

  // Handle click
  button.addEventListener('click', async () => {
    try {
      // Send message to background script
      const response = await browser.runtime.sendMessage({
        action: 'showNotification',
        message: 'Extension button clicked!'
      })
      
      if (response.success) {
        console.log('Notification sent successfully')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  })

  document.body.appendChild(button)
}

// Example: Modify page content
const modifyPageContent = () => {
  // Add a subtle indicator that the extension is active
  const indicator = document.createElement('div')
  indicator.innerHTML = '🔧'
  indicator.title = 'Chrome Extension Active'
  
  Object.assign(indicator.style, {
    position: 'fixed',
    bottom: '10px',
    left: '10px',
    fontSize: '16px',
    opacity: '0.6',
    zIndex: '9999',
    pointerEvents: 'none'
  })

  document.body.appendChild(indicator)
}

// Example: Listen for page events
const setupPageListeners = () => {
  // Listen for clicks on the page
  document.addEventListener('click', (event) => {
    // You can analyze clicks or perform actions based on what was clicked
    const target = event.target as HTMLElement
    if (target.tagName === 'A') {
      const link = target as HTMLAnchorElement
      console.log('Link clicked:', link.href)
    }
  })

  // Listen for form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement
    console.log('Form submitted:', form.action)
  })
}

// Initialize content script
const initializeContentScript = () => {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addFloatingButton()
      modifyPageContent()
      setupPageListeners()
    })
  } else {
    addFloatingButton()
    modifyPageContent()
    setupPageListeners()
  }
}

// Start the content script
initializeContentScript()

// Listen for messages from background script
browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Content script received message:', message)
  
  switch (message.action) {
    case 'getPageInfo':
      sendResponse({
        url: window.location.href,
        title: document.title,
        timestamp: Date.now()
      } as any)
      break
      
    case 'highlightElement':
      // Example: Highlight elements on the page
      const elements = document.querySelectorAll(message.selector)
      elements.forEach((el) => {
        (el as HTMLElement).style.backgroundColor = 'yellow'
        setTimeout(() => {
          (el as HTMLElement).style.backgroundColor = ''
        }, 2000)
      })
      sendResponse({ success: true, count: elements.length } as any)
      break
      
    case 'loadDrawing':
      // Simple example - just show an alert
      alert(`Loading drawing: ${message.title} (ID: ${message.gistId})`)
      
      // Send response back to popup
      sendResponse({ success: true, message: 'Drawing loaded!' })
      break
      
    default:
      sendResponse({ success: false, error: 'Unknown action' } as any)
  }
  
  return true
}) 