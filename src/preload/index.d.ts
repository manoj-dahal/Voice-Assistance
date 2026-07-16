import type { EraDesktopBridge } from './index'

declare global {
  interface Window {
    electron?: EraDesktopBridge
  }
}

export {}
