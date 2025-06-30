// Type declarations to fix webextension-polyfill TypeScript issues

declare module 'webextension-polyfill' {
  interface Runtime {
    onInstalled: {
      addListener(
        callback: (details: { reason: string }) => void
      ): void
    }
    onMessage: {
      addListener(
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void
    }
    sendMessage(message: any): Promise<any>
  }

  interface Storage {
    local: {
      get(keys?: string | string[] | object | null): Promise<any>
      set(items: object): Promise<void>
    }
    sync: {
      get(keys?: string | string[] | object | null): Promise<any>
      set(items: object): Promise<void>
    }
  }

  interface Tabs {
    query(queryInfo: any): Promise<any[]>
    onUpdated: {
      addListener(
        callback: (tabId: number, changeInfo: any, tab: any) => void
      ): void
    }
  }

  interface Action {
    onClicked: {
      addListener(callback: (tab: any) => void): void
    }
  }

  interface Notifications {
    create(options: {
      type: string
      iconUrl?: string
      title: string
      message: string
    }): Promise<string>
  }

  interface Browser {
    runtime: Runtime
    storage: Storage
    tabs: Tabs
    action: Action
    notifications: Notifications
  }

  const browser: Browser
  export default browser
} 