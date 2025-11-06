import browser from "webextension-polyfill"


export async function getCurrentTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  return tabs[0] || null;
}

export async function getCurrentTabId() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  return tabs[0]?.id || null;
}