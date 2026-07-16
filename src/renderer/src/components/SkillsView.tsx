import {
  ArrowRight,
  Braces,
  CheckCircle2,
  Code2,
  Download,
  FlaskConical,
  KeyRound,
  Play,
  Plus,
  Puzzle,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Workflow,
  X
} from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import {
  builtInSkills,
  manifestToSkill,
  roadmapSkills,
  skillPermissions,
  validateSkillManifest,
  type CustomSkill,
  type SkillDefinition,
  type SkillManifest,
  type SkillPermission,
  type SkillRisk
} from '../lib/skills'

type SkillsTab = 'library' | 'builder' | 'manifests'

interface SkillsViewProps {
  onPrompt: (prompt: string) => void
  onStatesChange: (states: Record<string, boolean>) => void
}

const enabledStorageKey = 'era.skills.enabled.v1'
const customStorageKey = 'era.skills.custom.v1'
const manifestStorageKey = 'era.skills.manifests.v1'

function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function createId(name: string) {
  const slug = name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `custom.${slug || 'skill'}.${Date.now().toString(36)}`
}

const sampleManifest = JSON.stringify({
  schemaVersion: 1,
  id: 'com.example.weather',
  name: 'Local Weather Reader',
  description: 'Reads weather from an approved MCP tool.',
  source: 'mcp',
  version: '1.0.0',
  triggers: ['show local weather'],
  permissions: ['provider.call'],
  risk: 'low',
  requiresConfirmation: false,
  tools: ['weather.current'],
  endpoint: 'http://localhost:3001'
}, null, 2)

export function SkillsView({ onPrompt, onStatesChange }: SkillsViewProps) {
  const [activeTab, setActiveTab] = useState<SkillsTab>('library')
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => readLocal(enabledStorageKey, {}))
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>(() => readLocal(customStorageKey, []))
  const [manifests, setManifests] = useState<SkillManifest[]>(() => readLocal(manifestStorageKey, []))
  const [selectedId, setSelectedId] = useState(builtInSkills[0].id)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [simulation, setSimulation] = useState<SkillDefinition | null>(null)
  const [builder, setBuilder] = useState({
    name: '',
    description: '',
    triggers: '',
    steps: '',
    risk: 'low' as SkillRisk,
    requiresConfirmation: false,
    permissions: [] as SkillPermission[]
  })
  const [manifestText, setManifestText] = useState(sampleManifest)
  const [manifestNotice, setManifestNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const pluginSkills = useMemo(() => manifests.map(manifestToSkill), [manifests])
  const skills = useMemo<SkillDefinition[]>(
    () => [...builtInSkills, ...customSkills, ...pluginSkills, ...roadmapSkills],
    [customSkills, pluginSkills]
  )
  const selected = skills.find((skill) => skill.id === selectedId) || skills[0]
  const categories = [...new Set(skills.map((skill) => skill.category))].sort()

  const visible = skills.filter((skill) => {
    const normalized = query.trim().toLocaleLowerCase()
    return (category === 'all' || skill.category === category) &&
      (!normalized || `${skill.name} ${skill.description} ${skill.triggers.join(' ')}`.toLocaleLowerCase().includes(normalized))
  })

  const saveEnabled = (next: Record<string, boolean>) => {
    setEnabled(next)
    window.localStorage.setItem(enabledStorageKey, JSON.stringify(next))
    onStatesChange(next)
  }

  const toggleSkill = (skill: SkillDefinition) => {
    saveEnabled({ ...enabled, [skill.id]: enabled[skill.id] === false })
  }

  const runSkill = (skill: SkillDefinition) => {
    if (enabled[skill.id] === false) return
    if (skill.source === 'built-in' && skill.exampleCommand && skill.status === 'available') {
      onPrompt(skill.exampleCommand)
      return
    }
    setSimulation(skill)
  }

  const createCustomSkill = (event: FormEvent) => {
    event.preventDefault()
    if (!builder.name.trim() || !builder.description.trim() || !builder.triggers.trim() || !builder.steps.trim()) return
    const skill: CustomSkill = {
      id: createId(builder.name),
      name: builder.name.trim(),
      description: builder.description.trim(),
      category: 'Custom',
      source: 'custom',
      status: 'simulation',
      risk: builder.risk,
      permissions: builder.permissions,
      triggers: builder.triggers.split(',').map((item) => item.trim()).filter(Boolean),
      steps: builder.steps.split('\n').map((item) => item.trim()).filter(Boolean),
      requiresConfirmation: builder.requiresConfirmation || builder.risk === 'high',
      createdAt: new Date().toISOString()
    }
    const next = [skill, ...customSkills]
    setCustomSkills(next)
    window.localStorage.setItem(customStorageKey, JSON.stringify(next))
    setSelectedId(skill.id)
    setBuilder({ name: '', description: '', triggers: '', steps: '', risk: 'low', requiresConfirmation: false, permissions: [] })
    setActiveTab('library')
  }

  const removeCustomSkill = (id: string) => {
    const next = customSkills.filter((skill) => skill.id !== id)
    setCustomSkills(next)
    window.localStorage.setItem(customStorageKey, JSON.stringify(next))
    setSelectedId(builtInSkills[0].id)
  }

  const importManifest = () => {
    try {
      const validated = validateSkillManifest(JSON.parse(manifestText))
      const next = [validated, ...manifests.filter((manifest) => manifest.id !== validated.id)]
      setManifests(next)
      window.localStorage.setItem(manifestStorageKey, JSON.stringify(next))
      setSelectedId(validated.id)
      setManifestNotice({ kind: 'success', text: `${validated.name} validated. No external code was executed.` })
    } catch (error) {
      setManifestNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Manifest validation failed' })
    }
  }

  const exportManifest = (manifest: SkillManifest) => {
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${manifest.id}.skill.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const togglePermission = (permission: SkillPermission) => {
    setBuilder((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission]
    }))
  }

  return (
    <div className="reference-secondary-page skills-page">
      <header className="skills-header">
        <div><span><Puzzle size={16} /> ERA capability layer</span><h1>Skills</h1><p>Built-in abilities, custom simulations, and validated plugin or MCP manifests under one permission model.</p></div>
        <div className="skills-summary"><strong>{skills.length}</strong><span>registered</span><small>{skills.filter((skill) => skill.source !== 'roadmap' && enabled[skill.id] !== false).length} operational or simulated</small></div>
      </header>

      <nav className="skills-tabs">
        <button type="button" className={activeTab === 'library' ? 'active' : ''} onClick={() => setActiveTab('library')}><Puzzle size={14} /> Skill library</button>
        <button type="button" className={activeTab === 'builder' ? 'active' : ''} onClick={() => setActiveTab('builder')}><Workflow size={14} /> Custom builder</button>
        <button type="button" className={activeTab === 'manifests' ? 'active' : ''} onClick={() => setActiveTab('manifests')}><Braces size={14} /> Plugin / MCP</button>
      </nav>

      {activeTab === 'library' && (
        <div className="skills-library">
          <div className="skills-catalog">
            <div className="skills-filters"><label><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skills or trigger phrases…" /></label><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
            <div className="skills-list">
              {visible.map((skill) => (
                <button type="button" className={`${selected?.id === skill.id ? 'selected ' : ''}${skill.source === 'roadmap' ? 'roadmap ' : ''}${enabled[skill.id] === false ? 'disabled' : ''}`} key={skill.id} onClick={() => setSelectedId(skill.id)}>
                  <span><Sparkles size={15} /></span><div><strong>{skill.name}</strong><small>{skill.category} · {skill.source}</small></div><i className={skill.risk}>{skill.risk}</i>
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <aside className="skill-inspector">
              <header><div><span>{selected.source}</span><h2>{selected.name}</h2></div>{selected.source === 'roadmap' ? <span className="roadmap-only-badge">NOT INSTALLED</span> : <button type="button" className={enabled[selected.id] === false ? 'skill-switch' : 'skill-switch on'} onClick={() => toggleSkill(selected)} aria-pressed={enabled[selected.id] !== false}><span /></button>}</header>
              <p>{selected.description}</p>
              <div className="skill-status-line"><span className={selected.status}>{selected.status}</span><span className={selected.risk}>{selected.risk} risk</span>{selected.requiresConfirmation && <span>confirmation</span>}</div>
              <section><strong>Trigger phrases</strong><div className="skill-chips">{selected.triggers.map((trigger) => <span key={trigger}>“{trigger}”</span>)}</div></section>
              <section><strong>Permissions</strong><div className="skill-chips permissions">{selected.permissions.length ? selected.permissions.map((permission) => <span key={permission}><KeyRound size={10} /> {permission}</span>) : <span>No privileged permissions</span>}</div></section>
              <section><strong>Execution plan</strong><ol>{selected.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
              <button type="button" className="run-skill-button" onClick={() => runSkill(selected)} disabled={enabled[selected.id] === false}><Play size={14} /> {selected.status === 'available' && selected.exampleCommand ? 'Try skill' : 'Run simulation'}</button>
              {selected.source === 'custom' && <button type="button" className="delete-skill-button" onClick={() => removeCustomSkill(selected.id)}><Trash2 size={13} /> Delete custom skill</button>}
            </aside>
          )}
        </div>
      )}

      {activeTab === 'builder' && (
        <form className="skill-builder" onSubmit={createCustomSkill}>
          <div className="skill-builder-heading"><div><Workflow size={19} /><span><strong>Custom skill builder</strong><small>Custom skills begin in simulation mode and cannot call tools directly.</small></span></div><button type="submit"><Plus size={14} /> Create skill</button></div>
          <div className="skill-builder-grid">
            <label>Name<input value={builder.name} onChange={(event) => setBuilder((current) => ({ ...current, name: event.target.value }))} placeholder="Weekly project review" /></label>
            <label>Risk<select value={builder.risk} onChange={(event) => setBuilder((current) => ({ ...current, risk: event.target.value as SkillRisk }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
            <label className="wide">Description<textarea value={builder.description} onChange={(event) => setBuilder((current) => ({ ...current, description: event.target.value }))} placeholder="What outcome should this skill produce?" /></label>
            <label className="wide">Trigger phrases<input value={builder.triggers} onChange={(event) => setBuilder((current) => ({ ...current, triggers: event.target.value }))} placeholder="review my week, run weekly review" /><small>Separate phrases with commas.</small></label>
            <label className="wide">Steps<textarea value={builder.steps} onChange={(event) => setBuilder((current) => ({ ...current, steps: event.target.value }))} placeholder={'Read active projects\nReview unfinished tasks\nDraft next actions'} /><small>One simulation step per line.</small></label>
          </div>
          <section className="permission-picker"><strong>Requested permissions</strong><div>{skillPermissions.map((permission) => <button type="button" className={builder.permissions.includes(permission) ? 'selected' : ''} key={permission} onClick={() => togglePermission(permission)}>{permission}</button>)}</div></section>
          <label className="builder-confirm"><input type="checkbox" checked={builder.requiresConfirmation} onChange={(event) => setBuilder((current) => ({ ...current, requiresConfirmation: event.target.checked }))} /><span>Require user confirmation before execution</span></label>
          <div className="builder-safety"><ShieldCheck size={15} /> High-risk custom skills are forced to confirmation mode. Creation never installs executable code.</div>
        </form>
      )}

      {activeTab === 'manifests' && (
        <div className="manifest-workspace">
          <section className="manifest-importer">
            <div><Braces size={19} /><span><strong>Manifest validator</strong><small>Paste a version-1 skill manifest. Validation does not connect or execute the endpoint.</small></span></div>
            <textarea value={manifestText} onChange={(event) => setManifestText(event.target.value)} spellCheck={false} />
            {manifestNotice && <p className={manifestNotice.kind}>{manifestNotice.kind === 'success' ? <CheckCircle2 size={13} /> : <X size={13} />}{manifestNotice.text}</p>}
            <button type="button" onClick={importManifest}><Upload size={14} /> Validate and register manifest</button>
          </section>
          <section className="manifest-list"><header><Code2 size={15} /> REGISTERED MANIFESTS <span>{manifests.length}</span></header>{manifests.length === 0 ? <div className="manifest-empty"><FlaskConical size={24} /><span>No external skill manifests registered.</span></div> : manifests.map((manifest) => <article key={manifest.id}><div><strong>{manifest.name}</strong><small>{manifest.id} · v{manifest.version}</small></div><span>{manifest.source}</span><button type="button" onClick={() => exportManifest(manifest)}><Download size={13} /></button></article>)}</section>
        </div>
      )}

      {simulation && (
        <div className="skill-simulation-backdrop" onMouseDown={() => setSimulation(null)} role="presentation"><section onMouseDown={(event) => event.stopPropagation()}><header><span><FlaskConical size={15} /> SIMULATION ONLY</span><button type="button" onClick={() => setSimulation(null)}><X size={15} /></button></header><h2>{simulation.name}</h2><p>No external tool or plugin code will run.</p><ol>{simulation.steps.map((step) => <li key={step}><CheckCircle2 size={13} /> {step}</li>)}</ol><div><ShieldCheck size={14} /> Permissions checked: {simulation.permissions.join(', ') || 'none'}</div><button type="button" onClick={() => setSimulation(null)}>Finish simulation</button></section></div>
      )}
    </div>
  )
}
