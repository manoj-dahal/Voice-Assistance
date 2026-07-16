import {
  isAllowedDesktopChannel,
  type DesktopChannel
} from '../main/lib/system'

export interface IpcInvoker {
  invoke(channel: DesktopChannel, ...args: unknown[]): Promise<unknown>
}

/**
 * Creates the minimal bridge exposed to the renderer by a packaged desktop
 * host. The real Electron preload should pass `ipcRenderer.invoke` here and
 * expose only the returned object through `contextBridge`.
 */
export function createEraDesktopBridge(invoke: IpcInvoker['invoke']) {
  return {
    ipcRenderer: {
      invoke(channel: string, ...args: unknown[]) {
        if (!isAllowedDesktopChannel(channel)) {
          return Promise.reject(new Error(`Desktop channel is not allowed: ${channel}`))
        }
        return invoke(channel, ...args)
      }
    }
  }
}

export type EraDesktopBridge = ReturnType<typeof createEraDesktopBridge>
