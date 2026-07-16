import {
  ArrowRight,
  Cable,
  Database,
  Download,
  KeyRound,
  Search,
  ShieldCheck,
  Unplug
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  currentConnectorCount,
  ecosystemCategories,
  minimumTargetConnectors,
  type EcosystemCategory,
  type EcosystemRisk,
  type EcosystemStage
} from '../lib/ecosystemRegistry'

interface EcosystemRegistryViewProps {
  providerConnected: boolean
  onPrompt: (prompt: string) => void
}

type StageFilter = 'all' | EcosystemStage

type RiskFilter = 'all' | EcosystemRisk

export function EcosystemRegistryView({
  providerConnected,
  onPrompt
}: EcosystemRegistryViewProps) {
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState<StageFilter>('all')
  const [risk, setRisk] = useState<RiskFilter>('all')
  const [selected, setSelected] = useState<EcosystemCategory | null>(ecosystemCategories[0])

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return ecosystemCategories.filter((category) =>
      (stage === 'all' || category.stage === stage) &&
      (risk === 'all' || category.risk === risk) &&
      (!normalized || `${category.name} ${category.examples} ${category.coverageGoal}`.toLocaleLowerCase().includes(normalized))
    )
  }, [query, risk, stage])

  const detectedFoundations = ecosystemCategories.reduce(
    (total, category) => total + currentConnectorCount(category, providerConnected),
    0
  )

  const exportManifest = () => {
    const payload = ecosystemCategories.map((category) => ({
      ...category,
      currentlyDetected: currentConnectorCount(category, providerConnected)
    }))
    const blob = new Blob([JSON.stringify({
      title: 'ERA Integration Ecosystem Roadmap',
      generatedAt: new Date().toISOString(),
      disclaimer: 'Target coverage is not connected integration count.',
      minimumTargetConnectors,
      detectedFoundations,
      categories: payload
    }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'era-ecosystem-roadmap.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="ecosystem-registry-panel">
      <div className="ecosystem-hero">
        <div>
          <span className="view-eyebrow"><Cable size={14} /> Permission-scoped connector roadmap</span>
          <h2>ERA Integration Ecosystem</h2>
          <p>A truthful registry of target coverage, detected foundations, authorization models, and approval boundaries across digital and physical systems.</p>
        </div>
        <div className="ecosystem-signal" aria-hidden="true"><span /><span /><span /><Cable size={22} /></div>
      </div>

      <div className="ecosystem-stats">
        <div><span>Categories</span><strong>{ecosystemCategories.length}</strong><small>requested domains</small></div>
        <div><span>Coverage target</span><strong>≥{minimumTargetConnectors}</strong><small>aspirational adapters</small></div>
        <div><span>Detected now</span><strong>{detectedFoundations}</strong><small>real foundations</small></div>
        <div><span>Universal claims</span><strong>0</strong><small>“all platforms” not assumed</small></div>
      </div>

      <div className="ecosystem-truth">
        <Unplug size={16} />
        <div><strong>A catalog is not a connection.</strong><span>Target counts describe roadmap breadth. A connector appears as detected only when this running app has verifiable implementation and configuration.</span></div>
        <button type="button" onClick={exportManifest}><Download size={13} /> Export manifest</button>
      </div>

      <div className="ecosystem-controls">
        <label><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories, tools, or protocols…" /></label>
        <select value={stage} onChange={(event) => setStage(event.target.value as StageFilter)}>
          <option value="all">All delivery stages</option>
          <option value="planned">Planned</option>
          <option value="research">Research</option>
        </select>
        <select value={risk} onChange={(event) => setRisk(event.target.value as RiskFilter)}>
          <option value="all">All risk levels</option>
          <option value="low">Low risk</option>
          <option value="moderate">Moderate risk</option>
          <option value="high">High risk</option>
          <option value="critical">Critical risk</option>
        </select>
        <span>{visible.length} categories</span>
      </div>

      <div className="ecosystem-layout">
        <div className="ecosystem-table">
          <header><span>Category</span><span>Target</span><span>Detected</span><span>Stage</span><span>Risk</span></header>
          {visible.map((category) => {
            const connected = currentConnectorCount(category, providerConnected)
            return (
              <button type="button" className={selected?.id === category.id ? 'selected' : ''} key={category.id} onClick={() => setSelected(category)}>
                <div><strong>{category.name}</strong><small>{category.examples}</small></div>
                <span>≥{category.targetMinimum}</span>
                <span className={connected ? 'detected' : ''}>{connected}</span>
                <i className={category.stage}>{category.stage}</i>
                <i className={category.risk}>{category.risk}</i>
              </button>
            )
          })}
          {visible.length === 0 && <div className="ecosystem-empty">No ecosystem categories match these filters.</div>}
        </div>

        {selected && (
          <aside className={`ecosystem-inspector ${selected.risk}`}>
            <span className="ecosystem-inspector-label">Connector category</span>
            <h3>{selected.name}</h3>
            <div className="ecosystem-current">
              <Database size={14} />
              <div><strong>{currentConnectorCount(selected, providerConnected)} detected</strong><span>of roadmap target ≥{selected.targetMinimum}</span></div>
            </div>
            {selected.localFoundation && <div className="foundation-badge"><ShieldCheck size={12} /> {selected.localFoundation}</div>}
            {selected.providerDependent && providerConnected && <div className="foundation-badge"><ShieldCheck size={12} /> Gemini provider configured</div>}

            <dl>
              <div><dt>Coverage goal</dt><dd>{selected.coverageGoal}</dd></div>
              <div><dt>Authorization</dt><dd>{selected.authorization}</dd></div>
              <div><dt>Data direction</dt><dd>{selected.dataDirection}</dd></div>
              <div><dt>Approval boundary</dt><dd>{selected.approvalBoundary}</dd></div>
              <div><dt>First milestone</dt><dd>{selected.firstMilestone}</dd></div>
            </dl>

            <div className="ecosystem-risk-note"><KeyRound size={13} /><span>{selected.risk} connector risk · least privilege required</span></div>
            <button type="button" onClick={() => onPrompt(`Create a secure connector MVP plan for ERA’s “${selected.name}” ecosystem category. Coverage goal: ${selected.coverageGoal}. Start only with: ${selected.firstMilestone} Authorization: ${selected.authorization}. Approval boundary: ${selected.approvalBoundary}. Include non-goals, threat model, data minimization, tests, and revocation. Do not claim the connector already exists.`)}>
              Design first connector <ArrowRight size={13} />
            </button>
          </aside>
        )}
      </div>
    </section>
  )
}
