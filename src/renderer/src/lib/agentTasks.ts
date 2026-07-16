import type { AgentId } from './orchestrator'

export type AgentTaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
export type AgentTaskPriority = 'low' | 'normal' | 'high'

export interface AgentTask {
  id: string
  title: string
  prompt: string
  agent: AgentId
  status: AgentTaskStatus
  priority: AgentTaskPriority
  dependencies: string[]
  result: string
  error: string
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export interface AgentMission {
  id: string
  objective: string
  taskIds: string[]
  createdAt: string
}

export const taskAgents: Array<{ id: AgentId; label: string; description: string }> = [
  { id: 'research', label: 'Research', description: 'Evidence and source analysis' },
  { id: 'planning', label: 'Planning', description: 'Roadmaps and priorities' },
  { id: 'knowledge', label: 'Knowledge', description: 'Explanation and synthesis' },
  { id: 'security', label: 'Security', description: 'Risk and permission review' },
  { id: 'finance', label: 'Finance', description: 'Educational financial analysis' },
  { id: 'automation', label: 'Automation', description: 'Workflow design' },
  { id: 'collaboration', label: 'Collaboration', description: 'Team and meeting support' }
]

function taskId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function task(
  title: string,
  prompt: string,
  agent: AgentId,
  priority: AgentTaskPriority,
  dependencies: string[] = []
): AgentTask {
  return {
    id: taskId(agent),
    title,
    prompt,
    agent,
    status: 'queued',
    priority,
    dependencies,
    result: '',
    error: '',
    createdAt: new Date().toISOString()
  }
}

export function createAgentMission(objective: string) {
  const research = task(
    'Evidence scan',
    `Research the objective carefully. Identify known facts, unknowns, constraints, and reliable sources when available. Objective: ${objective}`,
    'research',
    'high'
  )
  const security = task(
    'Risk and permission review',
    `Assess privacy, security, permission, operational, and misuse risks for this objective. Recommend controls. Objective: ${objective}`,
    'security',
    'high'
  )
  const planning = task(
    'Execution roadmap',
    `Create a practical phased roadmap with milestones, dependencies, non-goals, and acceptance tests. Objective: ${objective}`,
    'planning',
    'normal',
    [research.id, security.id]
  )
  const synthesis = task(
    'Mission synthesis',
    `Synthesize the mission into one concise recommendation with the best next action. Objective: ${objective}`,
    'knowledge',
    'normal',
    [planning.id]
  )
  const tasks = [research, security, planning, synthesis]
  const mission: AgentMission = {
    id: taskId('mission'),
    objective,
    taskIds: tasks.map((item) => item.id),
    createdAt: new Date().toISOString()
  }
  return { mission, tasks }
}

export function dependenciesSatisfied(task: AgentTask, tasks: AgentTask[]) {
  return task.dependencies.every((id) => tasks.find((candidate) => candidate.id === id)?.status === 'completed')
}

export function dependencyFailed(task: AgentTask, tasks: AgentTask[]) {
  return task.dependencies.some((id) => {
    const dependency = tasks.find((candidate) => candidate.id === id)
    return dependency?.status === 'failed' || dependency?.status === 'cancelled'
  })
}

export function priorityWeight(priority: AgentTaskPriority) {
  if (priority === 'high') return 3
  if (priority === 'normal') return 2
  return 1
}

export function containsSensitiveTaskContext(text: string) {
  return /\b(password|passcode|api key|secret key|private key|access token|refresh token|seed phrase|recovery phrase|credit card|cvv|bank account|medical record)\b/i.test(text) ||
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)
}
