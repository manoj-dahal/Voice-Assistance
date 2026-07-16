import {
  ArrowRight,
  CalendarClock,
  Download,
  FlaskConical,
  Map,
  Search,
  ShieldAlert,
  Sparkles
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  upgradeClaims,
  upgradeDispositionCopy,
  visionStatusCopy,
  visionSystems,
  type UpgradeClaim,
  type VisionStatus,
  type VisionSystem
} from '../lib/visionRegistry'

interface VisionRegistryViewProps {
  onPrompt: (prompt: string) => void
}

type RegistryFilter = 'all' | VisionStatus

export function VisionRegistryView({ onPrompt }: VisionRegistryViewProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<RegistryFilter>('all')
  const [domain, setDomain] = useState('all')
  const [selected, setSelected] = useState<VisionSystem | null>(visionSystems[0])
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeClaim | null>(upgradeClaims[0])

  const domains = useMemo(
    () => [...new Set(visionSystems.map((system) => system.domain))].sort(),
    []
  )

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return visionSystems.filter((system) =>
      (status === 'all' || system.status === status) &&
      (domain === 'all' || system.domain === domain) &&
      (!normalized || `${system.name} ${system.domain}`.toLocaleLowerCase().includes(normalized))
    )
  }, [domain, query, status])

  const counts = useMemo(() => ({
    planned: visionSystems.filter((system) => system.status === 'planned').length,
    research: visionSystems.filter((system) => system.status === 'research').length,
    speculative: visionSystems.filter((system) => system.status === 'speculative').length
  }), [])

  const exportManifest = () => {
    const blob = new Blob([JSON.stringify({
      title: 'ERA v2.0 Vision Registry',
      generatedAt: new Date().toISOString(),
      disclaimer: 'Roadmap inventory. Entries are not claims of completed runtime capability.',
      systems: visionSystems
    }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'era-v2-vision-registry.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="vision-registry-panel">
      <div className="registry-hero">
        <div>
          <span className="view-eyebrow"><Map size={14} /> Aspirational architecture inventory</span>
          <h2>ERA v2.0 Vision Registry</h2>
          <p>The complete long-range system catalog—searchable and ambitious, but deliberately separated from the repository’s live capability status.</p>
        </div>
        <div className="registry-total"><strong>{visionSystems.length}</strong><span>vision systems</span></div>
      </div>

      <div className="registry-truth-banner">
        <ShieldAlert size={16} />
        <div>
          <strong>Roadmap, not a completion report</strong>
          <span>No entry in this registry is marked complete. Open Continuum to see what the current application can actually do.</span>
        </div>
        <button type="button" onClick={exportManifest}><Download size={13} /> Export JSON</button>
      </div>

      <section className="upgrade-intake">
        <header>
          <div><ShieldAlert size={14} /><span>Latest upgrade intake</span></div>
          <small>{upgradeClaims.length} claims · 0 verified</small>
        </header>
        <div className="upgrade-intake-layout">
          <div className="upgrade-claim-list">
            {upgradeClaims.map((claim) => (
              <button
                type="button"
                className={`${claim.disposition}${selectedUpgrade?.id === claim.id ? ' selected' : ''}`}
                key={claim.id}
                onClick={() => setSelectedUpgrade(claim)}
              >
                <span>{claim.system}</span>
                <small>{claim.proposedUpgrade}</small>
                <i>{upgradeDispositionCopy[claim.disposition]}</i>
              </button>
            ))}
          </div>
          {selectedUpgrade && (
            <aside className={`upgrade-assessment ${selectedUpgrade.disposition}`}>
              <span>Claim assessment</span>
              <h3>{selectedUpgrade.system}</h3>
              <strong>{selectedUpgrade.proposedUpgrade}</strong>
              <p>{selectedUpgrade.assessment}</p>
              <div><b>Evidence gate</b><p>{selectedUpgrade.evidenceRequired}</p></div>
            </aside>
          )}
        </div>
      </section>

      <div className="registry-summary">
        {(Object.keys(visionStatusCopy) as VisionStatus[]).map((item) => (
          <button type="button" className={`${item}${status === item ? ' active' : ''}`} key={item} onClick={() => setStatus(status === item ? 'all' : item)}>
            {item === 'planned' ? <CalendarClock size={15} /> : item === 'research' ? <FlaskConical size={15} /> : <Sparkles size={15} />}
            <div><strong>{counts[item]}</strong><span>{visionStatusCopy[item].label}</span></div>
          </button>
        ))}
      </div>

      <div className="registry-controls">
        <label><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the vision registry…" /></label>
        <select value={domain} onChange={(event) => setDomain(event.target.value)} aria-label="Filter by domain">
          <option value="all">All domains</option>
          {domains.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as RegistryFilter)} aria-label="Filter by status">
          <option value="all">All roadmap statuses</option>
          <option value="planned">Planned</option>
          <option value="research">Research</option>
          <option value="speculative">Speculative</option>
        </select>
        <span>{visible.length} shown</span>
      </div>

      <div className="registry-layout">
        <div className="registry-list">
          {visible.map((system, index) => (
            <button type="button" className={`${system.status}${selected?.id === system.id ? ' selected' : ''}`} key={system.id} onClick={() => setSelected(system)}>
              <span>{String(index + 1).padStart(3, '0')}</span>
              <div><strong>{system.name}</strong><small>{system.domain} · {system.target}</small></div>
              <i>{visionStatusCopy[system.status].label}</i>
            </button>
          ))}
          {visible.length === 0 && <div className="registry-empty">No vision systems match these filters.</div>}
        </div>

        {selected && (
          <aside className={`registry-inspector ${selected.status}`}>
            <span className="registry-inspector-label">Vision system</span>
            <h3>{selected.name}</h3>
            <div className="registry-status"><i /> {visionStatusCopy[selected.status].label}</div>
            <dl>
              <div><dt>Domain</dt><dd>{selected.domain}</dd></div>
              <div><dt>Target</dt><dd>{selected.target}</dd></div>
              <div><dt>Status meaning</dt><dd>{visionStatusCopy[selected.status].meaning}</dd></div>
            </dl>
            <div className="registry-gate">
              <ShieldAlert size={14} />
              <p>This becomes “available” only after implementation, permission review, tests, and verifiable runtime evidence.</p>
            </div>
            {selected.status !== 'speculative' && (
              <button type="button" onClick={() => onPrompt(`Turn the ERA vision system “${selected.name}” into a reality-grounded delivery proposal. It is currently ${visionStatusCopy[selected.status].label.toLowerCase()}. Define a narrow MVP, non-goals, permissions, risks, architecture, milestones, and acceptance tests. Do not claim it already exists.`)}>
                Create delivery proposal <ArrowRight size={13} />
              </button>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}
