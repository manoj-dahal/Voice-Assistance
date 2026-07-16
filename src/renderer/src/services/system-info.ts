export interface AppItem {
  id: string
  name: string
  source: 'desktop' | 'web'
  url?: string
}

export function hasDesktopBridge() {
  return Boolean(window.electron?.ipcRenderer)
}

export async function getAllApps(): Promise<AppItem[]> {
  if (!window.electron?.ipcRenderer) return []
  const raw = await window.electron.ipcRenderer.invoke('get-all-apps')
  return (Array.isArray(raw) ? raw : [])
    .filter((item): item is { id: string; name: string } =>
      Boolean(item && typeof item === 'object' && 'id' in item && 'name' in item &&
        typeof item.id === 'string' && typeof item.name === 'string'))
    .map((item) => ({ id: item.id, name: item.name, source: 'desktop' as const }))
}

export async function openApp(app: AppItem) {
  if (app.source === 'desktop' && window.electron?.ipcRenderer) {
    await window.electron.ipcRenderer.invoke('open-app', app.name)
    return
  }
  if (app.url) window.open(app.url, '_blank', 'noopener,noreferrer')
}
