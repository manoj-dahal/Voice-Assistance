import {
  AudioLines,
  Bot,
  BrainCircuit,
  ChevronRight,
  Command,
  Orbit,
  Puzzle,
  Radio,
  Sparkles,
  Workflow
} from 'lucide-react'
import { Logo } from './Logo'

export type WorkspaceTab = 'console' | 'os' | 'agents' | 'skills' | 'apps' | 'automations' | 'memory' | 'gallery' | 'phone'

interface SidebarProps {
  activeTab: WorkspaceTab
  memoryCount: number
  providerConnected: boolean
  onTabChange: (tab: WorkspaceTab) => void
}

const navigation = [
  { id: 'console' as const, label: 'Ask ERA', icon: AudioLines },
  { id: 'os' as const, label: 'OS Center', icon: Orbit },
  { id: 'agents' as const, label: 'Agent Tasks', icon: Bot },
  { id: 'skills' as const, label: 'Skills', icon: Puzzle },
  { id: 'automations' as const, label: 'Automations', icon: Workflow },
  { id: 'memory' as const, label: 'Memory', icon: BrainCircuit }
]

export function Sidebar({
  activeTab,
  memoryCount,
  providerConnected,
  onTabChange
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo />
      </div>

      <nav className="side-nav" aria-label="Primary navigation">
        <p className="nav-label">Workspace</p>
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className={activeTab === id ? 'nav-item active' : 'nav-item'}
            onClick={() => onTabChange(id)}
          >
            <Icon size={17} />
            <span>{label}</span>
            {id === 'memory' && memoryCount > 0 && <b>{memoryCount}</b>}
          </button>
        ))}
      </nav>

      <div className="sidebar-feature">
        <div className="feature-icon">
          <Sparkles size={16} />
        </div>
        <div>
          <span>Try saying</span>
          <p>“Remember that my focus time is 9 AM.”</p>
        </div>
        <ChevronRight size={15} />
      </div>

      <div className="sidebar-spacer" />

      <div className="system-card">
        <div className="system-card-head">
          <span><Radio size={14} /> Intelligence</span>
          <i className={providerConnected ? 'online' : ''} />
        </div>
        <strong>Persona OS v0.7</strong>
        <p>
          {providerConnected
            ? 'Orchestration and Gemini reasoning are online.'
            : 'Local routing and core commands are ready.'}
        </p>
      </div>

      <div className="workspace-profile">
        <div className="profile-avatar"><Command size={16} /></div>
        <div>
          <strong>Personal workspace</strong>
          <span>Private on this device</span>
        </div>
        <span className="profile-dot" />
      </div>
    </aside>
  )
}
