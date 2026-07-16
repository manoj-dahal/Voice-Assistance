import {
  AppWindow,
  Camera,
  Check,
  Chrome,
  Clipboard,
  Code2,
  Copy,
  ExternalLink,
  Github,
  Mail,
  Music2,
  Search,
  TerminalSquare,
  Workflow
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  getAllApps,
  hasDesktopBridge,
  openApp,
  type AppItem
} from '../services/system-info'

const webApps: AppItem[] = [
  { id: 'github', name: 'GitHub', url: 'https://github.com', source: 'web' },
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', source: 'web' },
  { id: 'calendar', name: 'Google Calendar', url: 'https://calendar.google.com', source: 'web' },
  { id: 'notion', name: 'Notion', url: 'https://notion.so', source: 'web' },
  { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com', source: 'web' },
  { id: 'youtube', name: 'YouTube', url: 'https://youtube.com', source: 'web' }
]

function AppGlyph({ name }: { name: string }) {
  const value = name.toLocaleLowerCase()
  if (value.includes('github')) return <Github size={21} />
  if (value.includes('mail')) return <Mail size={21} />
  if (value.includes('code') || value.includes('dev')) return <Code2 size={21} />
  if (value.includes('chrome') || value.includes('edge') || value.includes('youtube')) return <Chrome size={21} />
  if (value.includes('spotify') || value.includes('music')) return <Music2 size={21} />
  if (value.includes('notion') || value.includes('calendar')) return <Workflow size={21} />
  return <TerminalSquare size={21} />
}

export function AppsView() {
  const desktopBridgeAvailable = hasDesktopBridge()
  const [desktopApps, setDesktopApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(desktopBridgeAvailable)
  const [query, setQuery] = useState('')
  const [clipboardText, setClipboardText] = useState('')
  const [screenshot, setScreenshot] = useState<{ dataUrl: string; width: number; height: number } | null>(null)
  const [desktopNotice, setDesktopNotice] = useState('')

  useEffect(() => {
    if (!desktopBridgeAvailable) return
    getAllApps()
      .then(setDesktopApps)
      .catch(() => setDesktopApps([]))
      .finally(() => setLoading(false))
  }, [desktopBridgeAvailable])

  const apps = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return [...desktopApps, ...webApps].filter((app) =>
      !normalized || app.name.toLocaleLowerCase().includes(normalized)
    )
  }, [desktopApps, query])

  const readClipboard = async () => {
    const result = await window.electron?.ipcRenderer.invoke('clipboard-read')
    const text = result && typeof result === 'object' && 'text' in result ? String(result.text || '') : ''
    setClipboardText(text)
    setDesktopNotice('Clipboard read from the local desktop bridge.')
  }

  const writeClipboard = async () => {
    await window.electron?.ipcRenderer.invoke('clipboard-write', clipboardText)
    setDesktopNotice('Clipboard updated through the local desktop bridge.')
  }

  const captureScreen = async () => {
    const result = await window.electron?.ipcRenderer.invoke('capture-screen')
    if (result && typeof result === 'object' && 'dataUrl' in result && 'width' in result && 'height' in result) {
      setScreenshot({
        dataUrl: String(result.dataUrl),
        width: Number(result.width),
        height: Number(result.height)
      })
      setDesktopNotice('Screenshot captured locally. It has not been sent to an AI provider.')
    }
  }

  return (
    <div className="reference-secondary-page apps-page">
      <header>
        <span><AppWindow size={16} /> Application library</span>
        <h1>Apps</h1>
        <p>Launch verified desktop applications through the packaged bridge, or open allowlisted web services.</p>
      </header>

      <div className="apps-toolbar">
        <label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications…" /></label>
        <div className={desktopBridgeAvailable ? 'desktop-bridge-status online' : 'desktop-bridge-status'}><i /><span>{desktopBridgeAvailable ? 'Desktop bridge online' : 'Browser mode'}</span></div>
        <strong>{loading ? 'INDEXING…' : `${apps.length} FOUND`}</strong>
      </div>

      {!desktopBridgeAvailable && (
        <div className="apps-browser-notice">
          <ExternalLink size={15} /> Installed-app discovery is intentionally unavailable in a normal browser. Package ERA with the authenticated Electron bridge to enable it.
        </div>
      )}

      {desktopBridgeAvailable && (
        <section className="desktop-tools-panel">
          <header><AppWindow size={15} /> DESKTOP AUTOMATION <span>LOCAL BRIDGE</span></header>
          <div className="desktop-tools-controls">
            <button type="button" onClick={() => void captureScreen()}><Camera size={14} /> Screenshot</button>
            <button type="button" onClick={() => void readClipboard()}><Clipboard size={14} /> Read clipboard</button>
            <label><input value={clipboardText} onChange={(event) => setClipboardText(event.target.value)} placeholder="Clipboard text…" /><button type="button" onClick={() => void writeClipboard()}><Copy size={13} /> Write</button></label>
          </div>
          {desktopNotice && <p><Check size={12} /> {desktopNotice}</p>}
          {screenshot && <figure><img src={screenshot.dataUrl} alt="Local desktop screenshot" /><figcaption>{screenshot.width}×{screenshot.height} · local preview</figcaption></figure>}
        </section>
      )}

      <div className="apps-grid">
        {apps.map((app) => (
          <button type="button" key={`${app.source}:${app.id}`} onClick={() => void openApp(app)}>
            <span className="app-glyph"><AppGlyph name={app.name} /></span>
            <div><strong>{app.name}</strong><small>{app.source === 'desktop' ? 'INSTALLED' : 'WEB SERVICE'}</small></div>
            <ExternalLink size={13} />
          </button>
        ))}
      </div>
    </div>
  )
}
