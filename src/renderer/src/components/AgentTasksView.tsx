import {
  Activity,
  Bot,
  CheckCircle2,
  CircleStop,
  Clock3,
  Layers3,
  Loader2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Workflow,
  XCircle
} from 'lucide-react'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  containsSensitiveTaskContext,
  createAgentMission,
  dependenciesSatisfied,
  dependencyFailed,
  priorityWeight,
  taskAgents,
  type AgentMission,
  type AgentTask,
  type AgentTaskPriority
} from '../lib/agentTasks'
import type { EraSettings } from '../lib/storage'

interface AgentTasksViewProps {
  providerConnected: boolean
  privacyMode: EraSettings['privacyMode']
  language: string
}

const tasksKey = 'era.agent.tasks.v1'
const missionsKey = 'era.agent.missions.v1'

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function id() {
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function AgentTasksView({ providerConnected, privacyMode, language }: AgentTasksViewProps) {
  const [tasks, setTasks] = useState<AgentTask[]>(() =>
    readStored<AgentTask[]>(tasksKey, []).map((task) =>
      task.status === 'running' ? { ...task, status: 'queued' } : task))
  const [missions, setMissions] = useState<AgentMission[]>(() => readStored(missionsKey, []))
  const [objective, setObjective] = useState('')
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [agent, setAgent] = useState(taskAgents[0].id)
  const [priority, setPriority] = useState<AgentTaskPriority>('normal')
  const [concurrency, setConcurrency] = useState(3)
  const [paused, setPaused] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const tasksRef = useRef(tasks)
  const controllers = useRef(new Map<string, AbortController>())

  useEffect(() => {
    tasksRef.current = tasks
    window.localStorage.setItem(tasksKey, JSON.stringify(tasks.slice(0, 250)))
  }, [tasks])

  useEffect(() => {
    window.localStorage.setItem(missionsKey, JSON.stringify(missions.slice(0, 50)))
  }, [missions])

  useEffect(() => () => {
    for (const controller of controllers.current.values()) controller.abort()
  }, [])

  useEffect(() => {
    if (privacyMode !== 'offline') return
    for (const controller of controllers.current.values()) controller.abort()
    controllers.current.clear()
    setTasks((current) => current.map((task) => task.status === 'running'
      ? { ...task, status: 'queued', startedAt: undefined }
      : task))
  }, [privacyMode])

  const executeTask = useCallback(async (task: AgentTask) => {
    if (privacyMode === 'offline') return
    if (privacyMode === 'balanced' && containsSensitiveTaskContext(`${task.title}\n${task.prompt}`)) {
      setTasks((current) => current.map((item) => item.id === task.id
        ? { ...item, status: 'failed', error: 'Context firewall blocked sensitive-looking task data.', completedAt: new Date().toISOString() }
        : item))
      return
    }

    const controller = new AbortController()
    controllers.current.set(task.id, controller)
    try {
      const dependencyContext = task.dependencies
        .map((dependencyId) => tasksRef.current.find((item) => item.id === dependencyId))
        .filter((item): item is AgentTask => Boolean(item?.result))
        .map((item) => `Dependency — ${item.title}:\n${item.result}`)
        .join('\n\n')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [{
            role: 'user',
            text: `${task.prompt}${dependencyContext ? `\n\nUse these completed dependency results:\n${dependencyContext}` : ''}`
          }],
          route: { agents: [task.agent, 'voice'], risk: 'low', language }
        })
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Agent task failed')
      setTasks((current) => current.map((item) => item.id === task.id
        ? { ...item, status: 'completed', result: body.text, error: '', completedAt: new Date().toISOString() }
        : item))
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setTasks((current) => current.map((item) => item.id === task.id
        ? { ...item, status: 'failed', error: error instanceof Error ? error.message : 'Agent task failed', completedAt: new Date().toISOString() }
        : item))
    } finally {
      controllers.current.delete(task.id)
    }
  }, [language, privacyMode])

  useEffect(() => {
    if (paused || !providerConnected || privacyMode === 'offline') return

    const blocked = tasks.filter((task) => task.status === 'queued' && dependencyFailed(task, tasks))
    if (blocked.length) {
      setTasks((current) => current.map((task) => blocked.some((item) => item.id === task.id)
        ? { ...task, status: 'failed', error: 'A required dependency did not complete.' }
        : task))
      return
    }

    const running = tasks.filter((task) => task.status === 'running').length
    const slots = Math.max(concurrency - running, 0)
    if (!slots) return
    const ready = tasks
      .filter((task) => task.status === 'queued' && dependenciesSatisfied(task, tasks))
      .sort((left, right) => priorityWeight(right.priority) - priorityWeight(left.priority))
      .slice(0, slots)
    if (!ready.length) return

    const readyIds = new Set(ready.map((task) => task.id))
    setTasks((current) => current.map((task) => readyIds.has(task.id)
      ? { ...task, status: 'running', startedAt: new Date().toISOString(), error: '' }
      : task))
    for (const task of ready) void executeTask(task)
  }, [concurrency, executeTask, paused, privacyMode, providerConnected, tasks])

  useEffect(() => {
    const pending = window.localStorage.getItem('era.agent.pending-mission')
    if (!pending) return
    window.localStorage.removeItem('era.agent.pending-mission')
    const created = createAgentMission(pending)
    setMissions((current) => [created.mission, ...current])
    setTasks((current) => [...created.tasks, ...current])
    setSelectedId(created.tasks[0].id)
  }, [])

  const createMission = (event: FormEvent) => {
    event.preventDefault()
    if (!objective.trim()) return
    const created = createAgentMission(objective.trim())
    setMissions((current) => [created.mission, ...current])
    setTasks((current) => [...created.tasks, ...current])
    setSelectedId(created.tasks[0].id)
    setObjective('')
  }

  const createTask = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !prompt.trim()) return
    const task: AgentTask = {
      id: id(), title: title.trim(), prompt: prompt.trim(), agent,
      status: 'queued', priority, dependencies: [], result: '', error: '',
      createdAt: new Date().toISOString()
    }
    setTasks((current) => [task, ...current])
    setSelectedId(task.id)
    setTitle('')
    setPrompt('')
  }

  const cancelTask = (taskId: string) => {
    controllers.current.get(taskId)?.abort()
    controllers.current.delete(taskId)
    setTasks((current) => current.map((task) => task.id === taskId
      ? { ...task, status: 'cancelled', completedAt: new Date().toISOString() }
      : task))
  }

  const retryTask = (taskId: string) => {
    setTasks((current) => current.map((task) => task.id === taskId
      ? { ...task, status: 'queued', error: '', result: '', startedAt: undefined, completedAt: undefined }
      : task))
  }

  const selected = tasks.find((task) => task.id === selectedId)
  const counts = useMemo(() => ({
    queued: tasks.filter((task) => task.status === 'queued').length,
    running: tasks.filter((task) => task.status === 'running').length,
    completed: tasks.filter((task) => task.status === 'completed').length,
    failed: tasks.filter((task) => task.status === 'failed').length
  }), [tasks])

  return (
    <div className="reference-secondary-page agents-page">
      <header className="agent-tasks-header">
        <div><span><Layers3 size={16} /> Concurrent orchestration</span><h1>Agent Tasks</h1><p>Run bounded specialist tasks concurrently, coordinate dependencies, cancel work, and inspect every result.</p></div>
        <div className="agent-runtime-state"><i className={providerConnected && privacyMode !== 'offline' ? 'online' : ''} /><span>{privacyMode === 'offline' ? 'OFFLINE MODE' : providerConnected ? 'RUNTIME READY' : 'PROVIDER REQUIRED'}</span></div>
      </header>

      <div className="agent-task-stats">
        <div><Clock3 size={14} /><span>Queued</span><strong>{counts.queued}</strong></div>
        <div><Loader2 size={14} /><span>Running</span><strong>{counts.running}</strong></div>
        <div><CheckCircle2 size={14} /><span>Completed</span><strong>{counts.completed}</strong></div>
        <div><XCircle size={14} /><span>Failed</span><strong>{counts.failed}</strong></div>
      </div>

      <div className="agent-control-bar">
        <button type="button" onClick={() => setPaused((current) => !current)}>{paused ? <Play size={13} /> : <Pause size={13} />}{paused ? 'Resume queue' : 'Pause queue'}</button>
        <label>Concurrency<input type="range" min="1" max="4" value={concurrency} onChange={(event) => setConcurrency(Number(event.target.value))} /><strong>{concurrency}</strong></label>
        <button type="button" onClick={() => setTasks((current) => current.filter((task) => task.status !== 'completed' && task.status !== 'cancelled'))}><Trash2 size={13} /> Clear finished</button>
      </div>

      <div className="agent-creation-grid">
        <form className="mission-creator" onSubmit={createMission}><header><Workflow size={15} /> MULTI-AGENT MISSION</header><p>Research and Security run in parallel. Planning waits for both, then Knowledge synthesizes the result.</p><textarea value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="Describe one objective for the agent team…" /><button type="submit" disabled={!objective.trim()}><Sparkles size={14} /> Create four-task mission</button></form>
        <form className="single-task-creator" onSubmit={createTask}><header><Bot size={15} /> SINGLE SPECIALIST TASK</header><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" /><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Task instructions…" /><div><select value={agent} onChange={(event) => setAgent(event.target.value as AgentTask['agent'])}>{taskAgents.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select><select value={priority} onChange={(event) => setPriority(event.target.value as AgentTaskPriority)}><option value="low">Low priority</option><option value="normal">Normal priority</option><option value="high">High priority</option></select><button type="submit" disabled={!title.trim() || !prompt.trim()}><Plus size={13} /> Add</button></div></form>
      </div>

      {privacyMode === 'balanced' && <div className="agent-context-firewall"><ShieldAlert size={14} /> Context firewall is active for every task before provider transmission.</div>}

      <div className="agent-task-layout">
        <section className="agent-task-list">
          <header><Activity size={14} /> TASK QUEUE <span>{tasks.length}</span></header>
          {tasks.length === 0 ? <div className="agent-task-empty"><Bot size={26} /><span>Create a mission or specialist task.</span></div> : tasks.map((task) => (
            <button type="button" className={`${task.status}${selectedId === task.id ? ' selected' : ''}`} key={task.id} onClick={() => setSelectedId(task.id)}>
              <span className="task-status-icon">{task.status === 'running' ? <Loader2 size={14} className="spin" /> : task.status === 'completed' ? <CheckCircle2 size={14} /> : task.status === 'failed' ? <XCircle size={14} /> : <Clock3 size={14} />}</span>
              <div><strong>{task.title}</strong><small>{task.agent} · {task.priority}{task.dependencies.length ? ` · waits for ${task.dependencies.length}` : ''}</small></div>
              <i>{task.status}</i>
            </button>
          ))}
        </section>

        <aside className="agent-task-inspector">
          {selected ? <><header><div><span>{selected.agent} agent</span><h2>{selected.title}</h2></div><i className={selected.status}>{selected.status}</i></header><p>{selected.prompt}</p><dl><div><dt>Priority</dt><dd>{selected.priority}</dd></div><div><dt>Dependencies</dt><dd>{selected.dependencies.length || 'None'}</dd></div><div><dt>Created</dt><dd>{new Date(selected.createdAt).toLocaleString()}</dd></div></dl>{selected.error && <div className="task-error">{selected.error}</div>}{selected.result && <article className="task-result">{selected.result}</article>}<footer>{(selected.status === 'running' || selected.status === 'queued') && <button type="button" className="cancel" onClick={() => cancelTask(selected.id)}><CircleStop size={13} /> Cancel</button>}{(selected.status === 'failed' || selected.status === 'cancelled') && <button type="button" onClick={() => retryTask(selected.id)}><RefreshCw size={13} /> Retry</button>}</footer></> : <div className="agent-inspector-empty">Select a task to inspect its prompt, dependencies, result, and controls.</div>}
        </aside>
      </div>

      <div className="mission-summary"><span>{missions.length} missions</span><span>{tasks.length} total tasks</span><span>Maximum concurrency: 4</span><span>No autonomous external tool execution</span></div>
    </div>
  )
}
