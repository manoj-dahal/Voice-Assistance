import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FlaskConical,
  Info,
  Keyboard,
  Network,
  PlugZap,
  Radio,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  capabilities,
  capabilityStatusLabels,
  resolveCapabilityStatus,
  type CapabilityCategory,
  type CapabilityDefinition,
  type CapabilityStatus
} from '../lib/capabilities'

interface ContinuumViewProps {
  providerConnected: boolean
  onPrompt: (prompt: string) => void
}

type StatusFilter = 'all' | CapabilityStatus

const categoryLabels: Record<CapabilityCategory, string> = {
  input: 'Unified input',
  intelligence: 'Intelligence engine',
  output: 'Unified output',
  governance: 'Trust & governance'
}

const categoryIcons = {
  input: Radio,
  intelligence: BrainCircuit,
  output: Keyboard,
  governance: ShieldCheck
}

const statusIcons = {
  available: CheckCircle2,
  'adapter-ready': PlugZap,
  research: FlaskConical,
  speculative: Sparkles
}

export function ContinuumView({ providerConnected, onPrompt }: ContinuumViewProps) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selected, setSelected] = useState<CapabilityDefinition | null>(capabilities[0])

  const resolved = useMemo(
    () => capabilities.map((capability) => ({
      capability,
      status: resolveCapabilityStatus(capability, providerConnected)
    })),
    [providerConnected]
  )

  const visible = filter === 'all'
    ? resolved
    : resolved.filter((item) => item.status === filter)

  const counts = useMemo(() => {
    const totals: Record<CapabilityStatus, number> = {
      available: 0,
      'adapter-ready': 0,
      research: 0,
      speculative: 0
    }
    for (const item of resolved) totals[item.status] += 1
    return totals
  }, [resolved])

  const selectedStatus = selected
    ? resolveCapabilityStatus(selected, providerConnected)
    : 'available'

  return (
    <section className="continuum-panel">
      <div className="continuum-hero">
        <div>
          <span className="view-eyebrow"><Network size={14} /> Unified intelligence continuum</span>
          <h2>One interface. Honest capability boundaries.</h2>
          <p>Available systems are separated from integrations, research, and speculative concepts—so ERA never pretends a diagram is a deployed capability.</p>
        </div>
        <div className="continuum-orbit" aria-hidden="true">
          <span /><span /><span /><BrainCircuit size={27} />
        </div>
      </div>

      <div className="runtime-truth-grid">
        <div><span>CONTEXT</span><strong>Bounded</strong><small>Configured model + recent conversation</small></div>
        <div><span>ORCHESTRATION</span><strong>10 roles</strong><small>Logical specialists, externally one voice</small></div>
        <div><span>CONSCIOUSNESS</span><strong>Not claimed</strong><small>No feelings, self-awareness, or independent will</small></div>
        <div><span>COMPUTE</span><strong>Classical</strong><small>Local browser + optional cloud AI, not quantum</small></div>
      </div>

      <div className="continuum-status-bar">
        <div className="continuum-filters">
          <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            All <b>{resolved.length}</b>
          </button>
          {(Object.keys(capabilityStatusLabels) as CapabilityStatus[]).map((status) => (
            <button
              type="button"
              className={filter === status ? `active ${status}` : status}
              key={status}
              onClick={() => setFilter(status)}
            >
              {capabilityStatusLabels[status]} <b>{counts[status]}</b>
            </button>
          ))}
        </div>
        <span><Info size={12} /> Status reflects this running repository—not a future concept.</span>
      </div>

      <div className="continuum-layout">
        <div className="capability-continuum">
          {(Object.keys(categoryLabels) as CapabilityCategory[]).map((category) => {
            const categoryItems = visible.filter((item) => item.capability.category === category)
            if (!categoryItems.length) return null
            const CategoryIcon = categoryIcons[category]
            return (
              <section className="continuum-row" key={category}>
                <header><CategoryIcon size={14} /><span>{categoryLabels[category]}</span><small>{categoryItems.length}</small></header>
                <div>
                  {categoryItems.map(({ capability, status }) => {
                    const StatusIcon = statusIcons[status]
                    return (
                      <button
                        type="button"
                        className={`${status}${selected?.id === capability.id ? ' selected' : ''}`}
                        key={capability.id}
                        onClick={() => setSelected(capability)}
                      >
                        <StatusIcon size={13} />
                        <span>{capability.name}</span>
                        <i />
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        {selected && (
          <aside className={`capability-inspector ${selectedStatus}`}>
            <header>
              <div><Cpu size={15} /><span>Capability inspector</span></div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close capability inspector"><X size={14} /></button>
            </header>
            <div className="inspector-status"><i /><span>{capabilityStatusLabels[selectedStatus]}</span></div>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>

            <div className="inspector-field">
              <span>What is real now</span>
              <p>{selected.reality}</p>
            </div>
            <div className="inspector-field">
              <span>Permission boundary</span>
              <p>{selected.permission}</p>
            </div>
            <div className="inspector-field">
              <span>Responsible next step</span>
              <p>{selected.nextStep}</p>
            </div>

            {selectedStatus !== 'speculative' && (
              <button
                type="button"
                className="plan-capability"
                onClick={() => onPrompt(`Create a reality-grounded implementation plan for the ERA capability “${selected.name}”. Current reality: ${selected.reality} Next step: ${selected.nextStep} Include permissions, risks, milestones, and tests.`)}
              >
                Plan this capability <ArrowRight size={13} />
              </button>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}
