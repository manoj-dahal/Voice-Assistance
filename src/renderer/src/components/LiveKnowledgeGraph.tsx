import { Focus, RotateCcw, Sparkles, Zap } from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { findMostRelatedNode } from '../lib/knowledgeGraph'
import type { MemoryItem, ProjectItem } from '../lib/storage'

export interface GraphFocusEvent {
  nodeId: string
  relatedNodeId: string
  nonce: number
}

interface LiveKnowledgeGraphProps {
  memories: MemoryItem[]
  projects: ProjectItem[]
  focusEvent: GraphFocusEvent | null
}

interface VisualNode {
  id: string
  label: string
  text: string
  kind: 'project' | MemoryItem['layer']
  x: number
  y: number
  relatedId: string
}

type BirthStyle = CSSProperties & {
  '--birth-x': string
  '--birth-y': string
}

type CameraStyle = CSSProperties & {
  '--camera-x': string
  '--camera-y': string
  '--camera-zoom': string
}

function hash(value: string) {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

function positionFor(id: string, kind: VisualNode['kind']) {
  const value = hash(id)
  const angle = ((value % 360) * Math.PI) / 180
  const isProject = kind === 'project'
  const radiusX = (isProject ? 225 : 135) + ((value >>> 8) % (isProject ? 42 : 125))
  const radiusY = (isProject ? 112 : 68) + ((value >>> 16) % (isProject ? 28 : 74))
  return {
    x: Math.round(Math.cos(angle) * radiusX),
    y: Math.round(Math.sin(angle) * radiusY)
  }
}

export function LiveKnowledgeGraph({
  memories,
  projects,
  focusEvent
}: LiveKnowledgeGraphProps) {
  const [cameraNodeId, setCameraNodeId] = useState('user')
  const [bornNodeId, setBornNodeId] = useState<string | null>(null)

  const nodes = useMemo(() => {
    const projectNodes: VisualNode[] = projects.slice(0, 10).map((project) => ({
      id: project.id,
      label: project.title,
      text: `${project.title} ${project.objective}`,
      kind: 'project',
      ...positionFor(project.id, 'project'),
      relatedId: 'user'
    }))

    const memoryNodes: VisualNode[] = []
    for (const memory of memories.slice(0, 45).reverse()) {
      const candidates = [...projectNodes, ...memoryNodes].map((node) => ({
        id: node.id,
        text: node.text
      }))
      const related = findMostRelatedNode(memory.content, candidates)
      memoryNodes.push({
        id: memory.id,
        label: memory.content,
        text: memory.content,
        kind: memory.layer,
        ...positionFor(memory.id, memory.layer),
        relatedId: related.id
      })
    }

    return [...projectNodes, ...memoryNodes]
  }, [memories, projects])

  useEffect(() => {
    if (!focusEvent) return
    setCameraNodeId(focusEvent.nodeId)
    setBornNodeId(focusEvent.nodeId)
    const timer = window.setTimeout(() => setBornNodeId(null), 1_700)
    return () => window.clearTimeout(timer)
  }, [focusEvent])

  const nodeMap = useMemo(
    () => new Map<string, { x: number; y: number; label: string }>([
      ['user', { x: 0, y: 0, label: 'You' }],
      ...nodes.map((node) => [node.id, { x: node.x, y: node.y, label: node.label }] as const)
    ]),
    [nodes]
  )

  const focused = nodeMap.get(cameraNodeId) || nodeMap.get('user')!
  const cameraStyle: CameraStyle = {
    '--camera-x': `${-focused.x}px`,
    '--camera-y': `${-focused.y}px`,
    '--camera-zoom': cameraNodeId === 'user' ? '0.92' : '1.16'
  }
  const focusedNode = nodes.find((node) => node.id === cameraNodeId)
  const focusedRelation = focusEvent?.nodeId === cameraNodeId
    ? nodeMap.get(focusEvent.relatedNodeId) || nodeMap.get('user')!
    : focusedNode
      ? nodeMap.get(focusedNode.relatedId) || nodeMap.get('user')!
      : null

  return (
    <div className="live-graph-shell">
      <div className="live-graph-toolbar">
        <div><i /><strong>LIVE</strong><span>{1 + projects.length + memories.length} nodes</span></div>
        <div className="graph-focus-copy">
          <Focus size={12} />
          <span>Camera: {focused.label}</span>
          {focusedRelation && cameraNodeId !== 'user' && <small>related to {focusedRelation.label}</small>}
        </div>
        <button type="button" onClick={() => setCameraNodeId('user')}><RotateCcw size={12} /> Reset view</button>
      </div>

      <div className="live-graph-viewport">
        <div className="live-graph-scan" />
        <div className="live-graph-world" style={cameraStyle}>
          <svg className="live-graph-edges" viewBox="0 0 720 380" aria-hidden="true">
            {nodes.map((node) => {
              const relatedId = focusEvent?.nodeId === node.id ? focusEvent.relatedNodeId : node.relatedId
              const related = nodeMap.get(relatedId) || nodeMap.get('user')!
              return (
                <line
                  key={`${node.id}:${relatedId}`}
                  className={focusEvent?.nodeId === node.id ? 'new-relation' : ''}
                  x1={360 + related.x}
                  y1={190 + related.y}
                  x2={360 + node.x}
                  y2={190 + node.y}
                />
              )
            })}
          </svg>

          <button
            type="button"
            className={cameraNodeId === 'user' ? 'live-node user focused' : 'live-node user'}
            style={{ left: 360, top: 190 }}
            onClick={() => setCameraNodeId('user')}
          >
            <span className="node-core"><Zap size={13} /></span>
            <strong>YOU</strong>
            <small>root context</small>
          </button>

          {nodes.map((node) => {
            const relatedId = focusEvent?.nodeId === node.id ? focusEvent.relatedNodeId : node.relatedId
            const related = nodeMap.get(relatedId) || nodeMap.get('user')!
            const isBorn = bornNodeId === node.id
            const style: BirthStyle = {
              left: 360 + node.x,
              top: 190 + node.y,
              '--birth-x': `${related.x - node.x}px`,
              '--birth-y': `${related.y - node.y}px`
            }
            return (
              <button
                type="button"
                key={node.id}
                className={`live-node ${node.kind}${cameraNodeId === node.id ? ' focused' : ''}${isBorn ? ' born' : ''}`}
                style={style}
                onClick={() => setCameraNodeId(node.id)}
                title={node.label}
              >
                <span className="node-core">{isBorn ? <Sparkles size={12} /> : null}</span>
                <strong>{node.label}</strong>
                <small>{node.kind}</small>
              </button>
            )
          })}
        </div>

        {nodes.length === 0 && (
          <div className="live-graph-empty">
            <Sparkles size={19} />
            <strong>Your brain is ready to grow.</strong>
            <span>Say “remember that…” to create the first captured node.</span>
          </div>
        )}
      </div>
    </div>
  )
}
