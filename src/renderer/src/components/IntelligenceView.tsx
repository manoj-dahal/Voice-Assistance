import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Cable,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  FileSearch,
  FolderKanban,
  GitBranch,
  Globe2,
  LockKeyhole,
  Network,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Telescope,
  Trash2,
  Upload,
  Workflow,
  X
} from 'lucide-react'
import { FormEvent, useMemo, useRef, useState } from 'react'
import { agentById, agents, type AgentId } from '../lib/orchestrator'
import type { AuditEntry, MemoryItem, ProjectItem } from '../lib/storage'
import { ContinuumView } from './ContinuumView'
import { EcosystemRegistryView } from './EcosystemRegistryView'
import { LiveKnowledgeGraph, type GraphFocusEvent } from './LiveKnowledgeGraph'
import { VisionRegistryView } from './VisionRegistryView'

export type OSModule = 'overview' | 'continuum' | 'registry' | 'ecosystem' | 'research' | 'planning' | 'vision' | 'finance'

export interface VisionRequest {
  image: string
  filename: string
  prompt: string
}

interface IntelligenceViewProps {
  providerConnected: boolean
  memoryCount: number
  memories: MemoryItem[]
  auditLog: AuditEntry[]
  projects: ProjectItem[]
  watchlist: string[]
  activeAgents: AgentId[]
  graphFocus: GraphFocusEvent | null
  visionAnalysis: string
  visionLoading: boolean
  onPrompt: (prompt: string) => void
  onAddProject: (title: string, objective: string) => void
  onUpdateProject: (id: string, status: ProjectItem['status']) => void
  onDeleteProject: (id: string) => void
  onAddWatchSymbol: (symbol: string) => void
  onRemoveWatchSymbol: (symbol: string) => void
  onVisionRequest: (request: VisionRequest) => void
  onClearAudit: () => void
}

const modules: Array<{ id: OSModule; label: string; icon: typeof Activity }> = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'continuum', label: 'Continuum', icon: Network },
  { id: 'registry', label: 'Vision Registry', icon: Telescope },
  { id: 'ecosystem', label: 'Ecosystem', icon: Cable },
  { id: 'research', label: 'Research', icon: Search },
  { id: 'planning', label: 'Planning', icon: FolderKanban },
  { id: 'vision', label: 'Screen', icon: Eye },
  { id: 'finance', label: 'Finance', icon: CircleDollarSign }
]

const researchTemplates = [
  'Research the latest developments in voice-first AI interfaces and summarize the most reliable findings.',
  'Compare Electron and Tauri for a secure desktop AI assistant. Include trade-offs and a recommendation.',
  'Create a competitor research framework for an AI productivity product.'
]

function OverviewModule({
  providerConnected,
  memoryCount,
  memories,
  auditLog,
  projects,
  activeAgents,
  graphFocus,
  onClearAudit
}: Pick<
  IntelligenceViewProps,
  'providerConnected' | 'memoryCount' | 'memories' | 'auditLog' | 'projects' | 'activeAgents' | 'graphFocus' | 'onClearAudit'
>) {
  return (
    <>
      <section className="os-visual-banner">
        <img className="os-banner-art" src="/brand/persona-os-banner.webp" alt="Abstract Persona OS neural network" />
        <img className="os-banner-emblem" src="/brand/era-vision-core.webp" alt="" />
        <div className="os-banner-shade" />
        <div className="os-banner-copy">
          <span>NEURAL OPERATING ENVIRONMENT</span>
          <strong>ERA // PERSONA</strong>
          <p>VOICE · MEMORY · AGENTS · AUTOMATION</p>
        </div>
        <div className="os-banner-status"><i /><span>SYSTEM OPERATIONAL</span></div>
      </section>

      <div className="os-stats">
        <div><Bot size={17} /><span>Specialists</span><strong>{agents.length}</strong></div>
        <div><BrainCircuit size={17} /><span>Saved memories</span><strong>{memoryCount}</strong></div>
        <div><Workflow size={17} /><span>Audit events</span><strong>{auditLog.length}</strong></div>
        <div><Globe2 size={17} /><span>Reasoning</span><strong>{providerConnected ? 'Online' : 'Local'}</strong></div>
      </div>

      <section className="orchestrator-card">
        <div className="os-section-heading">
          <div><Network size={16} /><span>Orchestrator flow</span></div>
          <small>Persona OS v0.7</small>
        </div>
        <div className="orchestration-flow">
          <div><span>01</span><strong>Intent</strong><small>Understand objective</small></div>
          <ArrowRight size={15} />
          <div><span>02</span><strong>Route</strong><small>Select specialists</small></div>
          <ArrowRight size={15} />
          <div><span>03</span><strong>Validate</strong><small>Risk & permissions</small></div>
          <ArrowRight size={15} />
          <div><span>04</span><strong>Respond</strong><small>One unified result</small></div>
        </div>
      </section>

      <section className="agent-section">
        <div className="os-section-heading">
          <div><GitBranch size={16} /><span>Specialist agents</span></div>
          <small>Minimum-agent routing</small>
        </div>
        <div className="agent-grid">
          {agents.map((agent) => (
            <article className={activeAgents.includes(agent.id) ? 'agent-card active' : 'agent-card'} key={agent.id}>
              <div className="agent-node"><span /></div>
              <div>
                <strong>{agent.name}</strong>
                <p>{agent.description}</p>
                <div>{agent.capabilities.map((capability) => <span key={capability}>{capability}</span>)}</div>
              </div>
              {activeAgents.includes(agent.id) && <small>Active</small>}
            </article>
          ))}
        </div>
      </section>

      <section className="knowledge-graph-section">
        <div className="os-section-heading">
          <div><Network size={16} /><span>LIVE knowledge graph</span></div>
          <small>semantic birth · camera tracking</small>
        </div>
        <LiveKnowledgeGraph memories={memories} projects={projects} focusEvent={graphFocus} />
      </section>

      <section className="audit-section">
        <div className="os-section-heading">
          <div><ShieldCheck size={16} /><span>Transparent audit log</span></div>
          {auditLog.length > 0 && <button type="button" onClick={onClearAudit}>Clear log</button>}
        </div>
        <div className="audit-list">
          {auditLog.length === 0 ? (
            <div className="audit-empty"><CheckCircle2 size={18} /> Actions and approvals will appear here.</div>
          ) : (
            auditLog.slice(0, 8).map((entry) => (
              <div className="audit-row" key={entry.id}>
                <span className={`audit-status ${entry.status}`} />
                <div>
                  <strong>{entry.summary}</strong>
                  <small>{entry.agents.map((agent) => agentById(agent)?.shortName).filter(Boolean).join(' + ') || 'ERA runtime'}</small>
                </div>
                <span className={`risk-badge ${entry.risk}`}>{entry.risk}</span>
                <time>{new Date(entry.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}

function ResearchModule({ onPrompt }: Pick<IntelligenceViewProps, 'onPrompt'>) {
  const [query, setQuery] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!query.trim()) return
    onPrompt(`Research this question carefully, separate facts from assumptions, and cite reliable sources when available: ${query.trim()}`)
  }

  return (
    <section className="module-panel research-module">
      <div className="module-hero-icon"><FileSearch size={26} /></div>
      <span className="view-eyebrow">Research agent</span>
      <h2>Turn a question into reliable understanding.</h2>
      <p>Persona routes the request through research and knowledge specialists, then ERA delivers one concise result.</p>
      <form className="module-query" onSubmit={submit}>
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What should ERA investigate?" />
        <button type="submit" disabled={!query.trim()}>Research <ArrowRight size={14} /></button>
      </form>
      <div className="template-grid">
        {researchTemplates.map((template, index) => (
          <button type="button" key={template} onClick={() => onPrompt(template)}>
            <span>0{index + 1}</span><p>{template}</p><ArrowRight size={14} />
          </button>
        ))}
      </div>
      <div className="source-note"><ShieldCheck size={15} /> ERA will identify uncertainty and will not invent citations.</div>
    </section>
  )
}

function PlanningModule({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onPrompt
}: Pick<
  IntelligenceViewProps,
  'projects' | 'onAddProject' | 'onUpdateProject' | 'onDeleteProject' | 'onPrompt'
>) {
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !objective.trim()) return
    onAddProject(title.trim(), objective.trim())
    setTitle('')
    setObjective('')
  }

  return (
    <section className="module-panel planning-module">
      <div className="module-title-row">
        <div>
          <span className="view-eyebrow">Planning agent</span>
          <h2>Keep goals moving.</h2>
          <p>Define the outcome. Persona helps shape milestones, risks, and the next practical action.</p>
        </div>
        <FolderKanban size={30} />
      </div>

      <form className="project-form" onSubmit={submit}>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Project name" />
        <input value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="What outcome do you want?" />
        <button type="submit" disabled={!title.trim() || !objective.trim()}><Plus size={15} /> Add project</button>
      </form>

      <div className="project-list">
        {projects.length === 0 ? (
          <div className="project-empty"><FolderKanban size={22} /><span>No active projects yet.</span></div>
        ) : (
          projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className={`project-state ${project.status}`}><span /></div>
              <div>
                <span className="project-status-label">{project.status}</span>
                <h3>{project.title}</h3>
                <p>{project.objective}</p>
                <div className="project-actions">
                  <button type="button" onClick={() => onPrompt(`Create a concise roadmap for my project “${project.title}”. Objective: ${project.objective}`)}>Build roadmap</button>
                  <select value={project.status} onChange={(event) => onUpdateProject(project.id, event.target.value as ProjectItem['status'])}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <button className="project-delete" type="button" onClick={() => onDeleteProject(project.id)} aria-label={`Delete ${project.title}`}><Trash2 size={14} /></button>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

function VisionModule({
  providerConnected,
  visionAnalysis,
  visionLoading,
  onVisionRequest
}: Pick<
  IntelligenceViewProps,
  'providerConnected' | 'visionAnalysis' | 'visionLoading' | 'onVisionRequest'
>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState('')
  const [filename, setFilename] = useState('')
  const [prompt, setPrompt] = useState('Describe the visible content, extract important text, and recommend the most useful next action.')
  const [error, setError] = useState('')

  const chooseFile = (file?: File) => {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 7_000_000) {
      setError('Choose a PNG, JPEG, or WebP image under 7 MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      setImage(String(reader.result || ''))
      setFilename(file.name)
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="module-panel vision-module">
      <div className="module-title-row">
        <div>
          <span className="view-eyebrow">Screen intelligence agent</span>
          <h2>See the context. Not beyond it.</h2>
          <p>Analyze a screenshot or image with explicit consent. ERA only receives the file you choose.</p>
        </div>
        <Eye size={30} />
      </div>

      <div className="vision-workspace">
        <div
          className={image ? 'vision-dropzone has-image' : 'vision-dropzone'}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            chooseFile(event.dataTransfer.files[0])
          }}
        >
          {image ? (
            <>
              <img src={image} alt="Selected visual context" />
              <button type="button" onClick={() => { setImage(''); setFilename('') }}><X size={14} /> Remove</button>
              <span>{filename}</span>
            </>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()}>
              <Upload size={23} /><strong>Choose visual context</strong><span>PNG, JPEG, or WebP · up to 7 MB</span>
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => chooseFile(event.target.files?.[0])} />
        </div>

        <div className="vision-controls">
          <label>What should ERA look for?</label>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          {error && <span className="field-error">{error}</span>}
          {!providerConnected && <span className="field-note">Connect Gemini to enable multimodal analysis.</span>}
          <button
            type="button"
            disabled={!image || !prompt.trim() || !providerConnected || visionLoading}
            onClick={() => onVisionRequest({ image, filename, prompt: prompt.trim() })}
          >
            {visionLoading ? 'Analyzing…' : 'Preview analysis'} <ArrowRight size={14} />
          </button>
          <div className="vision-privacy"><LockKeyhole size={14} /> Analysis requires approval before the image is sent.</div>
        </div>
      </div>

      {visionAnalysis && (
        <div className="vision-result">
          <span><Sparkles size={14} /> ERA visual analysis</span>
          <p>{visionAnalysis}</p>
        </div>
      )}
    </section>
  )
}

function FinanceModule({
  watchlist,
  onAddWatchSymbol,
  onRemoveWatchSymbol,
  onPrompt
}: Pick<
  IntelligenceViewProps,
  'watchlist' | 'onAddWatchSymbol' | 'onRemoveWatchSymbol' | 'onPrompt'
>) {
  const [symbol, setSymbol] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!symbol.trim()) return
    onAddWatchSymbol(symbol.trim().toUpperCase())
    setSymbol('')
  }

  return (
    <section className="module-panel finance-module">
      <div className="finance-warning">
        <ShieldCheck size={17} />
        <div><strong>Decision support, not autonomous trading</strong><span>ERA provides educational analysis and will never execute a trade or transfer funds.</span></div>
      </div>

      <div className="module-title-row">
        <div>
          <span className="view-eyebrow">Finance + research + security agents</span>
          <h2>Financial intelligence with risk in view.</h2>
          <p>Build a research watchlist and ask for balanced bull, bear, and neutral scenarios.</p>
        </div>
        <BarChart3 size={30} />
      </div>

      <form className="watchlist-form" onSubmit={submit}>
        <input value={symbol} maxLength={12} onChange={(event) => setSymbol(event.target.value.replace(/[^a-zA-Z0-9.-]/g, ''))} placeholder="Add symbol, e.g. AAPL" />
        <button type="submit" disabled={!symbol.trim()}><Plus size={14} /> Add</button>
      </form>

      <div className="watchlist-grid">
        {watchlist.map((item) => (
          <article key={item}>
            <div><CircleDollarSign size={17} /><strong>{item}</strong><span>Research watchlist</span></div>
            <button type="button" onClick={() => onRemoveWatchSymbol(item)} aria-label={`Remove ${item}`}><X size={14} /></button>
            <button type="button" onClick={() => onPrompt(`Give me an educational investment research framework for ${item}. Cover the business, potential catalysts, valuation factors, bull case, bear case, and key risks. Clearly state data limitations.`)}>
              Analyze <ArrowRight size={13} />
            </button>
          </article>
        ))}
      </div>

      <div className="finance-actions">
        <button type="button" onClick={() => onPrompt('Create a portfolio risk review checklist covering diversification, concentration, liquidity, volatility, and scenario risk. This is for education, not a trade recommendation.')}>Portfolio risk checklist</button>
        <button type="button" onClick={() => onPrompt('Explain how inflation and interest rates can affect equities, bonds, currencies, and household finances. Separate established relationships from uncertain outcomes.')}>Macro impact guide</button>
      </div>
    </section>
  )
}

export function IntelligenceView(props: IntelligenceViewProps) {
  const [activeModule, setActiveModule] = useState<OSModule>('overview')
  const title = useMemo(() => modules.find((module) => module.id === activeModule)?.label, [activeModule])

  return (
    <div className="workspace-view intelligence-view">
      <header className="view-header os-header">
        <div>
          <span className="view-eyebrow"><Network size={14} /> ERA intelligence runtime</span>
          <h1>Persona OS Center</h1>
          <p>Orchestration, specialist intelligence, permissions, memory, and auditable action.</p>
        </div>
        <div className="runtime-badge"><span /><div><strong>Persona v0.7</strong><small>{props.providerConnected ? 'Reasoning online' : 'Local foundation'}</small></div></div>
      </header>

      <nav className="module-tabs" aria-label="Persona OS modules">
        {modules.map(({ id, label, icon: Icon }) => (
          <button type="button" className={activeModule === id ? 'active' : ''} key={id} onClick={() => setActiveModule(id)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </nav>

      <div className="module-context"><span>{title}</span><small>Permission-aware · auditable · user controlled</small></div>

      {activeModule === 'overview' && <OverviewModule {...props} />}
      {activeModule === 'continuum' && (
        <ContinuumView providerConnected={props.providerConnected} onPrompt={props.onPrompt} />
      )}
      {activeModule === 'registry' && <VisionRegistryView onPrompt={props.onPrompt} />}
      {activeModule === 'ecosystem' && (
        <EcosystemRegistryView providerConnected={props.providerConnected} onPrompt={props.onPrompt} />
      )}
      {activeModule === 'research' && <ResearchModule onPrompt={props.onPrompt} />}
      {activeModule === 'planning' && <PlanningModule {...props} />}
      {activeModule === 'vision' && <VisionModule {...props} />}
      {activeModule === 'finance' && <FinanceModule {...props} />}
    </div>
  )
}
