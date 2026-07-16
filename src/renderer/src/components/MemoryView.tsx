import { BrainCircuit, Network, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import type { MemoryItem, MemoryLayer } from '../lib/storage'

interface MemoryViewProps {
  memories: MemoryItem[]
  enabled: boolean
  workingMemoryCount: number
  onToggleEnabled: () => void
  onAdd: (content: string, layer: MemoryLayer) => void
  onDelete: (id: string) => void
  onClear: () => void
}

const layerLabels: Record<MemoryLayer, string> = {
  'long-term': 'Long-term',
  semantic: 'Semantic',
  episodic: 'Episodic'
}

export function MemoryView({
  memories,
  enabled,
  workingMemoryCount,
  onToggleEnabled,
  onAdd,
  onDelete,
  onClear
}: MemoryViewProps) {
  const [value, setValue] = useState('')
  const [layer, setLayer] = useState<MemoryLayer>('long-term')
  const [filter, setFilter] = useState<'all' | MemoryLayer>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? memories : memories.filter((memory) => memory.layer === filter)),
    [filter, memories]
  )

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const content = value.trim()
    if (!content || !enabled) return
    onAdd(content, layer)
    setValue('')
  }

  return (
    <div className="workspace-view memory-view">
      <header className="view-header memory-header">
        <div>
          <span className="view-eyebrow"><BrainCircuit size={14} /> Persona memory architecture</span>
          <h1>Memory</h1>
          <p>Transparent context layers that you can inspect, correct, or remove.</p>
        </div>
        <div className="memory-header-actions">
          <button
            type="button"
            className={enabled ? 'memory-master-toggle enabled' : 'memory-master-toggle'}
            onClick={onToggleEnabled}
          >
            <span /> Memory {enabled ? 'on' : 'off'}
          </button>
          {memories.length > 0 && (
            <button type="button" className="text-button danger" onClick={onClear}>
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </header>

      <div className="memory-layers">
        <button className={filter === 'all' ? 'active' : ''} type="button" onClick={() => setFilter('all')}>
          <span>All saved</span><strong>{memories.length}</strong><small>Working: {workingMemoryCount} messages</small>
        </button>
        {(['long-term', 'semantic', 'episodic'] as MemoryLayer[]).map((memoryLayer) => (
          <button
            className={filter === memoryLayer ? 'active' : ''}
            type="button"
            key={memoryLayer}
            onClick={() => setFilter(memoryLayer)}
          >
            <span>{layerLabels[memoryLayer]}</span>
            <strong>{memories.filter((memory) => memory.layer === memoryLayer).length}</strong>
            <small>
              {memoryLayer === 'long-term'
                ? 'Preferences & goals'
                : memoryLayer === 'semantic'
                  ? 'Concepts & facts'
                  : 'Events & decisions'}
            </small>
          </button>
        ))}
      </div>

      {!enabled && (
        <div className="memory-disabled-note">
          <ShieldCheck size={16} /> Memory is paused. Existing items remain visible, but ERA will not save new details.
        </div>
      )}

      <form className="memory-form layered" onSubmit={submit}>
        <div>
          <Plus size={17} />
          <input
            value={value}
            disabled={!enabled}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Add a preference, concept, decision, or milestone…"
            aria-label="New memory"
          />
          <select
            value={layer}
            disabled={!enabled}
            onChange={(event) => setLayer(event.target.value as MemoryLayer)}
            aria-label="Memory layer"
          >
            <option value="long-term">Long-term</option>
            <option value="semantic">Semantic</option>
            <option value="episodic">Episodic</option>
          </select>
        </div>
        <button type="submit" disabled={!value.trim() || !enabled}>Remember</button>
      </form>

      {filtered.length === 0 ? (
        <div className="memory-empty">
          <div className="empty-memory-orb"><Network size={28} /></div>
          <h2>{memories.length ? 'No memories in this layer' : 'Nothing saved yet'}</h2>
          <p>Say “Remember that…” or add a detail above. ERA only stores information you explicitly choose.</p>
        </div>
      ) : (
        <div className="memory-list">
          {filtered.map((memory, index) => (
            <article className="memory-item" key={memory.id}>
              <span className="memory-number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <span className={`memory-layer-badge ${memory.layer}`}>{layerLabels[memory.layer]}</span>
                <p>{memory.content}</p>
                <time>
                  Saved {new Date(memory.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
              <button type="button" onClick={() => onDelete(memory.id)} aria-label={`Forget ${memory.content}`}>
                <Trash2 size={15} />
              </button>
            </article>
          ))}
        </div>
      )}

      <div className="memory-privacy">
        <ShieldCheck size={16} />
        <span><strong>Local by default.</strong> These memory layers stay in this browser and are not sent to cloud AI in this version.</span>
      </div>
    </div>
  )
}
