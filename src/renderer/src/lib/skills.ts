import { advancedFeatures } from './advancedFeatures'
import { ecosystemCategories } from './ecosystemRegistry'
import { visionSystems } from './visionRegistry'

export type SkillRisk = 'low' | 'medium' | 'high'
export type SkillSource = 'built-in' | 'custom' | 'plugin' | 'mcp' | 'roadmap'
export type SkillStatus = 'available' | 'simulation' | 'adapter-required' | 'planned' | 'research' | 'speculative'

export const skillPermissions = [
  'microphone',
  'speech.output',
  'memory.read',
  'memory.write',
  'notes.read',
  'notes.write',
  'web.search',
  'image.upload',
  'app.launch',
  'notifications',
  'provider.call',
  'files.read',
  'files.write',
  'calendar.read',
  'calendar.write',
  'email.read',
  'email.draft',
  'email.send',
  'terminal.execute'
] as const

export type SkillPermission = (typeof skillPermissions)[number]

export interface SkillDefinition {
  id: string
  name: string
  description: string
  category: string
  source: SkillSource
  status: SkillStatus
  risk: SkillRisk
  permissions: SkillPermission[]
  triggers: string[]
  steps: string[]
  requiresConfirmation: boolean
  exampleCommand?: string
  pattern?: RegExp
}

export interface CustomSkill extends Omit<SkillDefinition, 'source' | 'status' | 'pattern'> {
  source: 'custom'
  status: 'simulation'
  createdAt: string
}

export interface SkillManifest {
  schemaVersion: 1
  id: string
  name: string
  description: string
  source: 'plugin' | 'mcp'
  version: string
  triggers: string[]
  permissions: SkillPermission[]
  risk: SkillRisk
  requiresConfirmation: boolean
  tools: string[]
  endpoint?: string
}

const highImpactPermissions = new Set<SkillPermission>([
  'files.write',
  'calendar.write',
  'email.send',
  'terminal.execute'
])

export const builtInSkills: SkillDefinition[] = [
  {
    id: 'voice-conversation', name: 'Voice Conversation', category: 'Core', source: 'built-in', status: 'available', risk: 'low',
    description: 'Listen through the browser and speak ERA responses with the selected voice profile.',
    permissions: ['microphone', 'speech.output'], triggers: ['listen', 'speak', 'voice'],
    steps: ['Request microphone access', 'Transcribe one utterance', 'Route intent', 'Speak approved response'],
    requiresConfirmation: false, exampleCommand: 'What can you do?'
  },
  {
    id: 'memory-capture', name: 'Memory Capture', category: 'Memory', source: 'built-in', status: 'available', risk: 'medium',
    description: 'Write an explicit “remember that” capture to Markdown and the LIVE graph.',
    permissions: ['memory.write', 'notes.write'], triggers: ['remember that'],
    steps: ['Reject sensitive secrets', 'Write Markdown capture', 'Create related graph node', 'Confirm aloud'],
    requiresConfirmation: false, exampleCommand: 'Remember that ERA skills should remain permission scoped',
    pattern: /^remember(?: that)?\s+/i
  },
  {
    id: 'memory-search', name: 'Memory Search', category: 'Memory', source: 'built-in', status: 'available', risk: 'low',
    description: 'Search Markdown notes, memories, and projects from the command palette.',
    permissions: ['memory.read', 'notes.read'], triggers: ['search memory', 'find note', 'what do you remember'],
    steps: ['Tokenize local query', 'Rank local context', 'Return snippets and provenance'],
    requiresConfirmation: false, exampleCommand: 'What do you remember?',
    pattern: /\b(what do you remember|show my memories|find note|search memory)\b/i
  },
  {
    id: 'timer', name: 'Focus Timer', category: 'Productivity', source: 'built-in', status: 'available', risk: 'low',
    description: 'Run a local countdown and notify the user when it finishes.',
    permissions: ['notifications', 'speech.output'], triggers: ['start timer', 'set timer'],
    steps: ['Parse duration', 'Start local countdown', 'Display status', 'Notify completion'],
    requiresConfirmation: false, exampleCommand: 'Start a 25 minute timer',
    pattern: /\b(start|set).{0,12}\b(timer|minute timer|second timer)\b/i
  },
  {
    id: 'reminders', name: 'Durable Reminders', category: 'Productivity', source: 'built-in', status: 'available', risk: 'low',
    description: 'Create persistent relative, daily, or weekly reminders.',
    permissions: ['notifications', 'speech.output'], triggers: ['remind me'],
    steps: ['Parse schedule', 'Persist locally', 'Recover after reload', 'Notify at due time'],
    requiresConfirmation: false, exampleCommand: 'Remind me in 30 minutes to review ERA',
    pattern: /^remind me\s+/i
  },
  {
    id: 'daily-brief', name: 'Daily Brief', category: 'Productivity', source: 'built-in', status: 'available', risk: 'low',
    description: 'Generate a concise briefing from available local context.',
    permissions: ['memory.read', 'speech.output'], triggers: ['daily brief', 'morning brief'],
    steps: ['Read available date and workspace state', 'Identify priorities', 'Generate concise briefing'],
    requiresConfirmation: false, exampleCommand: 'Give me my daily brief',
    pattern: /\b(daily|morning) brief/i
  },
  {
    id: 'web-research', name: 'Grounded Web Research', category: 'Knowledge', source: 'built-in', status: 'available', risk: 'medium',
    description: 'Route research to a configured provider and return available sources.',
    permissions: ['web.search', 'provider.call'], triggers: ['research', 'latest', 'find sources'],
    steps: ['Apply context firewall', 'Route research intent', 'Request grounded results', 'Return sources'],
    requiresConfirmation: false, exampleCommand: 'Research current voice-first AI interfaces',
    pattern: /\b(research|latest|find sources|investigate)\b/i
  },
  {
    id: 'screen-analysis', name: 'Screen & Image Analysis', category: 'Vision', source: 'built-in', status: 'available', risk: 'medium',
    description: 'Analyze one user-selected image after an explicit transmission preview.',
    permissions: ['image.upload', 'provider.call'], triggers: ['analyze image', 'analyze screenshot', 'read screen'],
    steps: ['Validate image', 'Preview provider transmission', 'Require approval', 'Analyze visible content'],
    requiresConfirmation: true, exampleCommand: 'Explain how to analyze a screenshot safely',
    pattern: /\b(analyze|read|explain).{0,20}\b(image|screenshot|screen)\b/i
  },
  {
    id: 'app-launcher', name: 'Application Launcher', category: 'Desktop', source: 'built-in', status: 'available', risk: 'medium',
    description: 'Open allowlisted web services or verified desktop apps through the optional bridge.',
    permissions: ['app.launch'], triggers: ['open app', 'launch app', 'open GitHub'],
    steps: ['Resolve approved destination', 'Use web allowlist or desktop bridge', 'Record action'],
    requiresConfirmation: false, exampleCommand: 'Open GitHub',
    pattern: /^(open|launch|go to)\s+/i
  },
  {
    id: 'planning', name: 'Project Planning', category: 'Knowledge', source: 'built-in', status: 'available', risk: 'low',
    description: 'Turn goals into milestones, risks, and next actions.',
    permissions: ['memory.read', 'provider.call'], triggers: ['plan', 'roadmap', 'prioritize'],
    steps: ['Understand objective', 'Identify constraints', 'Build milestones', 'Recommend next action'],
    requiresConfirmation: false, exampleCommand: 'Create a roadmap for ERA skills',
    pattern: /\b(plan|roadmap|prioritize|milestone)\b/i
  },
  {
    id: 'safe-calculator', name: 'Safe Calculator', category: 'Utility', source: 'built-in', status: 'available', risk: 'low',
    description: 'Evaluate basic arithmetic without eval or cloud transmission.',
    permissions: [], triggers: ['calculate', 'what is'],
    steps: ['Validate arithmetic tokens', 'Parse expression', 'Return local result'],
    requiresConfirmation: false, exampleCommand: 'Calculate (12 + 8) / 4',
    pattern: /^(calculate|what is|what's)\s+[\d\s.+\-*/()×÷]+$/i
  },
  {
    id: 'provider-router', name: 'Provider Router', category: 'System', source: 'built-in', status: 'available', risk: 'medium',
    description: 'Use the active encrypted AI provider and an approved fallback on failure.',
    permissions: ['provider.call'], triggers: ['ask ERA', 'provider fallback'],
    steps: ['Check privacy mode', 'Select active provider', 'Call provider', 'Try configured fallback on failure'],
    requiresConfirmation: false
  },
  {
    id: 'privacy-lock', name: 'Emergency Privacy Lock', category: 'Security', source: 'built-in', status: 'available', risk: 'low',
    description: 'Stop voice and connected AI activity while pausing memory writes.',
    permissions: [], triggers: ['privacy lock', 'emergency lock'],
    steps: ['Stop speech', 'Stop listening', 'Close overlays', 'Switch offline', 'Pause memory'],
    requiresConfirmation: false, exampleCommand: 'Activate privacy lock',
    pattern: /^(?:activate )?(?:emergency )?privacy lock$/i
  },
  {
    id: 'multi-agent-mission', name: 'Multi-Agent Mission', category: 'Agents', source: 'built-in', status: 'available', risk: 'medium',
    description: 'Run concurrent specialist tasks with dependencies, cancellation, retries, and visible results.',
    permissions: ['provider.call'], triggers: ['start multi-agent mission', 'create agent mission'],
    steps: ['Run Research and Security concurrently', 'Release Planning after dependencies', 'Synthesize final result', 'Keep every task inspectable'],
    requiresConfirmation: false, exampleCommand: 'Start a multi-agent mission for planning the next ERA release',
    pattern: /^(?:start|create|run)(?: a)? multi-agent mission (?:for|to)\s+/i
  },
  {
    id: 'language-switch', name: 'Multilingual Voice', category: 'Core', source: 'built-in', status: 'available', risk: 'low',
    description: 'Search the complete ISO language catalog and switch recognition, speech selection, and connected AI response language.',
    permissions: ['microphone', 'speech.output', 'provider.call'], triggers: ['switch language to', 'speak in', 'change voice language to'],
    steps: ['Search ISO 639-3 catalog', 'Resolve a BCP-47 speech tag', 'Check installed voices', 'Update recognition and response language'],
    requiresConfirmation: false, exampleCommand: 'Switch language to Nepali',
    pattern: /^(?:switch|change|set)(?: the)? (?:voice )?language to\s+|^speak in\s+/i
  },
  {
    id: 'workflow-preview', name: 'Workflow Preview', category: 'Automation', source: 'built-in', status: 'available', risk: 'medium',
    description: 'Show purpose, steps, impact, and risk before running an automation.',
    permissions: [], triggers: ['run workflow', 'run macro'],
    steps: ['Load workflow', 'Calculate permissions and impact', 'Request approval', 'Record result'],
    requiresConfirmation: true
  }
]

function ecosystemPermissions(id: string): SkillPermission[] {
  if (id === 'email' || id === 'communication') return ['email.read', 'email.draft', 'email.send']
  if (id === 'calendar') return ['calendar.read', 'calendar.write']
  if (id === 'storage' || id === 'development' || id === 'research-science') return ['files.read', 'files.write']
  if (id === 'ai-platforms' || id === 'web-automation') return ['provider.call']
  if (id === 'smart-home' || id === 'iot-sensors' || id === 'robotics') return ['provider.call']
  return []
}

export const roadmapSkills: SkillDefinition[] = [
  ...visionSystems.map((system): SkillDefinition => ({
    id: `roadmap.vision.${system.id}`,
    name: system.name,
    description: `${system.domain} vision target. This is a roadmap capability, not a completed runtime skill.`,
    category: `Roadmap · ${system.domain}`,
    source: 'roadmap',
    status: system.status,
    risk: system.status === 'speculative' ? 'high' : system.status === 'research' ? 'medium' : 'low',
    permissions: [],
    triggers: [`plan ${system.name}`, `design ${system.name}`],
    steps: [
      'Define a narrow measurable outcome',
      'Document non-goals and permission boundaries',
      'Build an isolated implementation',
      'Add tests and reproducible evidence',
      'Promote only after runtime verification'
    ],
    requiresConfirmation: system.status !== 'planned'
  })),
  ...ecosystemCategories.map((category): SkillDefinition => {
    const permissions = ecosystemPermissions(category.id)
    return {
      id: `roadmap.connector.${category.id}`,
      name: `${category.name} Connector Skill`,
      description: `${category.coverageGoal}. First milestone: ${category.firstMilestone}`,
      category: 'Roadmap · Connectors',
      source: 'roadmap',
      status: category.stage,
      risk: category.risk === 'critical' || category.risk === 'high'
        ? 'high'
        : category.risk === 'moderate'
          ? 'medium'
          : 'low',
      permissions,
      triggers: [`connect ${category.name}`, `plan ${category.name} integration`],
      steps: [
        category.firstMilestone,
        `Apply authorization: ${category.authorization}`,
        `Enforce approval boundary: ${category.approvalBoundary}`,
        'Test revocation, failure, and audit behavior before activation'
      ],
      requiresConfirmation: permissions.some((permission) => highImpactPermissions.has(permission)) || category.risk === 'critical'
    }
  }),
  ...advancedFeatures.map((feature): SkillDefinition => ({
    id: `roadmap.${feature.id}`,
    name: feature.name,
    description: `${feature.purpose} This is an implementation target, not an installed function.`,
    category: `Roadmap · ${feature.category}`,
    source: 'roadmap',
    status: feature.status,
    risk: feature.risk,
    permissions: [],
    triggers: [`plan ${feature.name}`, `simulate ${feature.name}`],
    steps: [
      'Define measurable behavior and explicit non-goals',
      'Identify data, permission, privacy, and failure boundaries',
      'Build a simulation or isolated prototype',
      'Add acceptance, security, and accessibility tests',
      'Promote only after verified runtime evidence'
    ],
    requiresConfirmation: feature.risk === 'high'
  }))
]

export function matchBuiltInSkill(input: string) {
  return builtInSkills.find((skill) => skill.pattern?.test(input))
}

export function validateSkillManifest(value: unknown): SkillManifest {
  if (!value || typeof value !== 'object') throw new Error('Manifest must be a JSON object')
  const manifest = value as Record<string, unknown>
  if (manifest.schemaVersion !== 1) throw new Error('schemaVersion must be 1')
  if (manifest.source !== 'plugin' && manifest.source !== 'mcp') throw new Error('source must be plugin or mcp')
  for (const field of ['id', 'name', 'description', 'version']) {
    if (typeof manifest[field] !== 'string' || !String(manifest[field]).trim()) {
      throw new Error(`${field} is required`)
    }
  }
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/.test(String(manifest.id))) {
    throw new Error('id must be a namespaced identifier such as com.example.skill')
  }
  const triggers = Array.isArray(manifest.triggers)
    ? manifest.triggers.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : []
  if (!triggers.length) throw new Error('At least one trigger phrase is required')
  const permissions = Array.isArray(manifest.permissions) ? manifest.permissions : []
  if (permissions.some((permission) => !skillPermissions.includes(permission as SkillPermission))) {
    throw new Error('Manifest requests an unknown permission')
  }
  const risk = manifest.risk
  if (risk !== 'low' && risk !== 'medium' && risk !== 'high') throw new Error('risk must be low, medium, or high')
  const requiresConfirmation = manifest.requiresConfirmation === true
  if (permissions.some((permission) => highImpactPermissions.has(permission as SkillPermission)) && !requiresConfirmation) {
    throw new Error('High-impact permissions require confirmation')
  }
  const tools = Array.isArray(manifest.tools)
    ? manifest.tools.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : []
  let endpoint: string | undefined
  if (manifest.endpoint !== undefined) {
    if (typeof manifest.endpoint !== 'string') throw new Error('endpoint must be a URL')
    const parsed = new URL(manifest.endpoint)
    const local = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)
    if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && local)) {
      throw new Error('Skill endpoint must use HTTPS, except for localhost')
    }
    endpoint = parsed.toString().replace(/\/$/, '')
  }
  return {
    schemaVersion: 1,
    id: String(manifest.id),
    name: String(manifest.name).trim(),
    description: String(manifest.description).trim(),
    source: manifest.source,
    version: String(manifest.version).trim(),
    triggers,
    permissions: permissions as SkillPermission[],
    risk,
    requiresConfirmation,
    tools,
    ...(endpoint ? { endpoint } : {})
  }
}

export function manifestToSkill(manifest: SkillManifest): SkillDefinition {
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    category: manifest.source === 'mcp' ? 'MCP' : 'Plugin',
    source: manifest.source,
    status: 'adapter-required',
    risk: manifest.risk,
    permissions: manifest.permissions,
    triggers: manifest.triggers,
    steps: manifest.tools.length ? manifest.tools.map((tool) => `Call declared tool: ${tool}`) : ['Await adapter implementation'],
    requiresConfirmation: manifest.requiresConfirmation
  }
}
