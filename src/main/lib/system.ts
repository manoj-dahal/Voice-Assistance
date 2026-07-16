export interface DesktopAppItem {
  id: string
  name: string
  executable?: string
}

export interface SystemInformation {
  platform: NodeJS.Platform
  architecture: string
  hostname?: string
}

export const allowedDesktopChannels = [
  'agent-status',
  'get-all-apps',
  'open-app',
  'close-app',
  'capture-screen',
  'clipboard-read',
  'clipboard-write',
  'open-external-url',
  'window-minimize',
  'window-toggle-maximize',
  'window-close',
  'secure-get-keys',
  'secure-save-keys'
] as const

export type DesktopChannel = (typeof allowedDesktopChannels)[number]

export function isAllowedDesktopChannel(value: string): value is DesktopChannel {
  return allowedDesktopChannels.includes(value as DesktopChannel)
}

export function sanitizeDesktopApp(raw: unknown): DesktopAppItem | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return null
  const name = value.name.trim().slice(0, 200)
  const id = value.id.trim().slice(0, 300)
  if (!name || !id) return null
  return {
    id,
    name,
    ...(typeof value.executable === 'string'
      ? { executable: value.executable.slice(0, 2_000) }
      : {})
  }
}
