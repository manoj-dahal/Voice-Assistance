import {
  AppWindow,
  BrainCircuit,
  Images,
  LayoutDashboard,
  Menu,
  Minus,
  Phone,
  Settings,
  Square,
  X
} from 'lucide-react'
import { Logo } from './Logo'
import type { WorkspaceTab } from './Sidebar'

interface TitlebarProps {
  activeTab: WorkspaceTab
  settingsOpen: boolean
  onToggleMenu: () => void
  onNavigate: (tab: WorkspaceTab) => void
  onOpenSettings: () => void
}

export function Titlebar({
  activeTab,
  settingsOpen,
  onToggleMenu,
  onNavigate,
  onOpenSettings
}: TitlebarProps) {
  const desktopBridge = window.electron?.ipcRenderer
  const windowAction = (channel: 'window-minimize' | 'window-toggle-maximize' | 'window-close') => {
    if (desktopBridge) void desktopBridge.invoke(channel)
  }

  return (
    <header className="reference-topbar">
      <div className="reference-topbar-left">
        <button type="button" className="reference-menu-button" onClick={onToggleMenu} aria-label="Toggle ERA navigation">
          <Menu size={18} />
        </button>
        <button type="button" className="reference-logo-button" onClick={() => onNavigate('console')} aria-label="Open AERA dashboard">
          <Logo compact />
        </button>
        <button type="button" className="reference-agent-badge" onClick={() => onNavigate('console')}>
          <strong>AERA</strong>
        </button>
      </div>

      <nav className="reference-nav reference-nav-primary" aria-label="Agent workspace">
        <button type="button" className={activeTab === 'console' ? 'active' : ''} onClick={() => onNavigate('console')}><LayoutDashboard size={17} /><span>Dashboard</span></button>
        <button type="button" className={activeTab === 'automations' ? 'active' : ''} onClick={() => onNavigate('automations')}><BrainCircuit size={17} /><span>Macros</span></button>
        <button type="button" className={activeTab === 'apps' ? 'active' : ''} onClick={() => onNavigate('apps')}><AppWindow size={17} /><span>Apps</span></button>
      </nav>

      <nav className="reference-nav reference-nav-secondary" aria-label="Agent utilities">
        <button type="button" className={activeTab === 'gallery' ? 'active' : ''} onClick={() => onNavigate('gallery')}><Images size={17} /><span>Gallery</span></button>
        <button type="button" className={activeTab === 'phone' ? 'active' : ''} onClick={() => onNavigate('phone')}><Phone size={17} /><span>Phone</span></button>
        <button type="button" className={settingsOpen ? 'active' : ''} onClick={onOpenSettings}><Settings size={17} /><span>Settings</span></button>
      </nav>

      <div className="reference-window-controls" aria-label={desktopBridge ? 'Desktop window controls' : 'Desktop window controls unavailable in browser preview'}>
        <button type="button" disabled={!desktopBridge} onClick={() => windowAction('window-minimize')} title="Minimize"><Minus size={13} /></button>
        <button type="button" disabled={!desktopBridge} onClick={() => windowAction('window-toggle-maximize')} title="Maximize or restore"><Square size={10} /></button>
        <button type="button" disabled={!desktopBridge} onClick={() => windowAction('window-close')} title="Close"><X size={13} /></button>
      </div>
    </header>
  )
}
