import {
  AppWindow,
  BrainCircuit,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Workflow,
  X
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { MemoryItem, ProjectItem } from '../lib/storage'
import type { WorkspaceTab } from './Sidebar'

interface DiskNote {
  filename: string
  title: string
  content: string
}

interface CommandPaletteProps {
  memories: MemoryItem[]
  projects: ProjectItem[]
  onClose: () => void
  onNavigate: (tab: WorkspaceTab) => void
  onPrompt: (prompt: string) => void
  onOpenSettings: () => void
}

interface PaletteResult {
  id: string
  title: string
  subtitle: string
  kind: 'navigation' | 'command' | 'memory' | 'project' | 'note'
  action: () => void
}

export function CommandPalette({
  memories,
  projects,
  onClose,
  onNavigate,
  onPrompt,
  onOpenSettings
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [notes, setNotes] = useState<DiskNote[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const normalized = query.trim()
    if (normalized.length < 2) {
      setNotes([])
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(normalized)}`, { signal: controller.signal })
        .then((response) => response.ok ? response.json() : { results: [] })
        .then((body) => setNotes(
          (Array.isArray(body.results) ? body.results : []).map((result: { filename: string; title: string; snippet: string }) => ({
            filename: result.filename,
            title: result.title,
            content: result.snippet
          }))
        ))
        .catch((error) => {
          if (!(error instanceof Error && error.name === 'AbortError')) setNotes([])
        })
    }, 180)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  const results = useMemo(() => {
    const navigate = (tab: WorkspaceTab) => () => { onNavigate(tab); onClose() }
    const base: PaletteResult[] = [
      { id: 'nav-dashboard', title: 'Dashboard', subtitle: 'Open the voice command center', kind: 'navigation', action: navigate('console') },
      { id: 'nav-apps', title: 'Apps', subtitle: 'Open the application library', kind: 'navigation', action: navigate('apps') },
      { id: 'nav-skills', title: 'Skills', subtitle: 'Manage built-in, custom, plugin, and MCP skills', kind: 'navigation', action: navigate('skills') },
      { id: 'nav-agents', title: 'Agent Tasks', subtitle: 'Run concurrent specialist tasks and missions', kind: 'navigation', action: navigate('agents') },
      { id: 'nav-macros', title: 'Macros', subtitle: 'Open automations and workflows', kind: 'navigation', action: navigate('automations') },
      { id: 'nav-memory', title: 'Memory Bank', subtitle: 'Open Markdown notes and memory layers', kind: 'navigation', action: navigate('memory') },
      { id: 'nav-os', title: 'OS Center', subtitle: 'Open Persona agents and registries', kind: 'navigation', action: navigate('os') },
      { id: 'nav-settings', title: 'Settings', subtitle: 'Providers, voice, and privacy', kind: 'navigation', action: () => { onOpenSettings(); onClose() } },
      { id: 'cmd-brief', title: 'Give me my daily brief', subtitle: 'Run a concise workspace briefing', kind: 'command', action: () => { onPrompt('Give me my daily brief'); onClose() } },
      { id: 'cmd-focus', title: 'Start a 25 minute timer', subtitle: 'Begin a local focus session', kind: 'command', action: () => { onPrompt('Start a 25 minute timer'); onClose() } },
      { id: 'cmd-diagnostics', title: 'Run ERA diagnostics', subtitle: 'Check runtime, provider, memory, and voice readiness', kind: 'command', action: () => { onPrompt('Run ERA diagnostics and clearly separate verified checks from unavailable checks.'); onClose() } }
    ]

    const dynamic: PaletteResult[] = [
      ...memories.map((memory) => ({
        id: `memory:${memory.id}`,
        title: memory.content,
        subtitle: `${memory.layer} memory`,
        kind: 'memory' as const,
        action: navigate('memory')
      })),
      ...projects.map((project) => ({
        id: `project:${project.id}`,
        title: project.title,
        subtitle: project.objective,
        kind: 'project' as const,
        action: () => { onPrompt(`Show the current status and next action for my project “${project.title}”. Objective: ${project.objective}`); onClose() }
      })),
      ...notes.map((note) => ({
        id: `note:${note.filename}`,
        title: note.title,
        subtitle: note.content.slice(0, 120) || 'Markdown note',
        kind: 'note' as const,
        action: () => {
          window.localStorage.setItem('era.notes.open', note.filename)
          onNavigate('memory')
          onClose()
        }
      }))
    ]

    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return base.slice(0, 9)
    return [...base, ...dynamic]
      .filter((result) => `${result.title} ${result.subtitle} ${result.kind}`.toLocaleLowerCase().includes(normalized))
      .slice(0, 18)
  }, [memories, notes, onClose, onNavigate, onOpenSettings, onPrompt, projects, query])

  useEffect(() => setActiveIndex(0), [query])

  const iconFor = (kind: PaletteResult['kind']) => {
    if (kind === 'navigation') return <LayoutDashboard size={15} />
    if (kind === 'command') return <Sparkles size={15} />
    if (kind === 'memory') return <BrainCircuit size={15} />
    if (kind === 'project') return <FolderKanban size={15} />
    return <FileText size={15} />
  }

  return (
    <div className="command-palette-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="ERA command palette" onMouseDown={(event) => event.stopPropagation()}>
        <header><Search size={18} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
          if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((current) => Math.min(current + 1, results.length - 1)) }
          if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((current) => Math.max(current - 1, 0)) }
          if (event.key === 'Enter' && results[activeIndex]) results[activeIndex].action()
        }} placeholder="Search commands, notes, memories, and projects…" /><kbd>CTRL ⇧ E</kbd><button type="button" onClick={onClose}><X size={15} /></button></header>
        <div className="command-palette-results">
          {results.length === 0 ? <div className="palette-empty">No matching command or local context.</div> : results.map((result, index) => (
            <button type="button" className={index === activeIndex ? 'active' : ''} key={result.id} onMouseEnter={() => setActiveIndex(index)} onClick={result.action}>
              <span>{iconFor(result.kind)}</span><div><strong>{result.title}</strong><small>{result.subtitle}</small></div><i>{result.kind}</i>
            </button>
          ))}
        </div>
        <footer><span><Workflow size={12} /> Enter to open</span><span><AppWindow size={12} /> ↑ ↓ to navigate</span><span><Settings size={12} /> Esc to close</span></footer>
      </section>
    </div>
  )
}
