export type AgentId =
  | 'voice'
  | 'memory'
  | 'research'
  | 'knowledge'
  | 'planning'
  | 'automation'
  | 'screen'
  | 'security'
  | 'finance'
  | 'collaboration'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface AgentDefinition {
  id: AgentId
  name: string
  shortName: string
  description: string
  capabilities: string[]
}

export interface OrchestrationRoute {
  agents: AgentId[]
  intent: string
  risk: RiskLevel
  requiresConfirmation: boolean
}

export const agents: AgentDefinition[] = [
  {
    id: 'voice',
    name: 'Voice Agent',
    shortName: 'Voice',
    description: 'Natural conversation and concise spoken delivery.',
    capabilities: ['Speech', 'Conversation', 'Continuity']
  },
  {
    id: 'memory',
    name: 'Memory Agent',
    shortName: 'Memory',
    description: 'Relevant preferences, projects, and context retrieval.',
    capabilities: ['Recall', 'Context', 'Personalization']
  },
  {
    id: 'research',
    name: 'Research Agent',
    shortName: 'Research',
    description: 'Evidence gathering, comparison, and source analysis.',
    capabilities: ['Research', 'Sources', 'Trends']
  },
  {
    id: 'knowledge',
    name: 'Knowledge Agent',
    shortName: 'Knowledge',
    description: 'Teaching, synthesis, documentation, and explanation.',
    capabilities: ['Explain', 'Synthesize', 'Learn']
  },
  {
    id: 'planning',
    name: 'Planning Agent',
    shortName: 'Planning',
    description: 'Roadmaps, milestones, priorities, and project strategy.',
    capabilities: ['Roadmaps', 'Goals', 'Priorities']
  },
  {
    id: 'automation',
    name: 'Automation Agent',
    shortName: 'Automation',
    description: 'Workflow design and permission-aware execution.',
    capabilities: ['Workflows', 'Tools', 'Execution']
  },
  {
    id: 'screen',
    name: 'Screen Agent',
    shortName: 'Vision',
    description: 'Visible interface, image, document, and OCR analysis.',
    capabilities: ['Vision', 'OCR', 'UI context']
  },
  {
    id: 'security',
    name: 'Security Agent',
    shortName: 'Security',
    description: 'Risk, privacy, permissions, and safety validation.',
    capabilities: ['Risk', 'Privacy', 'Governance']
  },
  {
    id: 'finance',
    name: 'Finance Agent',
    shortName: 'Finance',
    description: 'Educational market, portfolio, and risk intelligence.',
    capabilities: ['Markets', 'Portfolio', 'Risk']
  },
  {
    id: 'collaboration',
    name: 'Collaboration Agent',
    shortName: 'Collaboration',
    description: 'Meetings, shared decisions, ownership, and follow-through.',
    capabilities: ['Meetings', 'Teams', 'Actions']
  }
]

const patterns: Array<{ agent: AgentId; terms: RegExp }> = [
  {
    agent: 'finance',
    terms: /\b(stock|share|portfolio|invest|market|etf|bond|crypto|budget|saving|retirement|inflation|interest rate|valuation|revenue|profit)\b/i
  },
  {
    agent: 'research',
    terms: /\b(research|find sources|latest|current|trend|competitor|compare|evidence|market analysis|news|investigate)\b/i
  },
  {
    agent: 'planning',
    terms: /\b(plan|roadmap|milestone|priority|prioritize|project|goal|schedule|strategy|next steps|organize)\b/i
  },
  {
    agent: 'automation',
    terms: /\b(automate|workflow|open|launch|timer|reminder|send|create event|book|execute|run|trigger|integrate)\b/i
  },
  {
    agent: 'screen',
    terms: /\b(screen|screenshot|image|photo|ocr|visible|document|pdf|dashboard|interface|error message)\b/i
  },
  {
    agent: 'security',
    terms: /\b(security|privacy|permission|credential|password|threat|vulnerab|risk|compliance|delete|account)\b/i
  },
  {
    agent: 'memory',
    terms: /\b(remember|recall|memory|preference|what do you know about me|last time)\b/i
  },
  {
    agent: 'collaboration',
    terms: /\b(meeting|team|agenda|minutes|stakeholder|assign|collaborat|standup)\b/i
  }
]

const highRisk =
  /\b(buy|sell|trade|transfer|pay|purchase|delete|erase|remove account|change password|security setting|sign contract|approve contract|send (an )?(email|message)|publish|post publicly)\b/i
const mediumRisk = /\b(upload|share|connect|book|schedule|create event|modify|install|download|execute|run command)\b/i

export function routeRequest(input: string): OrchestrationRoute {
  const selected: AgentId[] = []

  for (const { agent, terms } of patterns) {
    if (terms.test(input)) selected.push(agent)
  }

  if (selected.includes('finance') && !selected.includes('security')) selected.push('security')
  if (selected.includes('finance') && !selected.includes('research')) selected.push('research')
  if (selected.length === 0) selected.push('knowledge')
  if (!selected.includes('voice')) selected.push('voice')

  const risk: RiskLevel = highRisk.test(input) ? 'high' : mediumRisk.test(input) ? 'medium' : 'low'
  const uniqueAgents = [...new Set(selected)].slice(0, 5)

  return {
    agents: uniqueAgents,
    intent: uniqueAgents[0] === 'knowledge' ? 'general assistance' : `${uniqueAgents[0]} support`,
    risk,
    requiresConfirmation: risk === 'high'
  }
}

export function agentById(id: AgentId) {
  return agents.find((agent) => agent.id === id)
}
