import {
  AlertCircle,
  BellRing,
  Bot,
  Clock3,
  CloudOff,
  Cpu,
  Folder,
  LockKeyhole,
  MemoryStick,
  Wifi,
  X
} from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { ActionConfirmationModal, type ActionProposal } from './components/ActionConfirmationModal'
import { AgentTasksView } from './components/AgentTasksView'
import type { ActiveTimer, ConversationMessage } from './components/ActivityPanel'
import { AppsView } from './views/APP'
import { AutomationsView, type AutomationDefinition } from './components/AutomationsView'
import { CommandPalette } from './components/CommandPalette'
import { Composer } from './components/Composer'
import { FileAttachmentIcon } from './components/FileAttachmentIcon'
import { GalleryView } from './views/Gallery'
import { Dashboard } from './views/Dashboard'
import { IntelligenceView, type VisionRequest } from './components/IntelligenceView'
import { Logo } from './components/Logo'
import { MemoryView } from './components/MemoryView'
import { ParticleVoiceCore } from './components/ParticleVoiceCore'
import { PhoneView } from './views/Phone'
import { ReminderDock } from './components/ReminderDock'
import { SettingsModal } from './views/Settings'
import { Sidebar, type WorkspaceTab } from './components/Sidebar'
import { SkillsView } from './components/SkillsView'
import { Titlebar } from './components/Titlebar'
import type { VoiceState } from './components/VoiceOrb'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import {
  analyzeImage,
  askCloudAssistant,
  rememberInNotes,
  runLocalCommand,
  type AssistantAction
} from './lib/assistant'
import {
  attachmentContext,
  canReadAsText,
  classifyAttachment,
  formatFileSize,
  type ConversationAttachment
} from './lib/files'
import { entryFromDataTransferItem, summarizeDroppedDirectory } from './lib/folders'
import { findMostRelatedNode } from './lib/knowledgeGraph'
import { agentById, routeRequest, type AgentId, type RiskLevel } from './lib/orchestrator'
import { matchBuiltInSkill } from './lib/skills'
import { createEraUtterance } from './lib/voice'
import type { GraphFocusEvent } from './components/LiveKnowledgeGraph'
import {
  loadAuditLog,
  loadMemories,
  loadProjects,
  loadReminders,
  loadSettings,
  loadWatchlist,
  saveAuditLog,
  saveMemories,
  saveProjects,
  saveReminders,
  saveSettings,
  saveWatchlist,
  type AuditEntry,
  type EraSettings,
  type MemoryItem,
  type MemoryLayer,
  type ProjectItem,
  type ReminderItem
} from './lib/storage'

const NotesView = lazy(async () => ({
  default: (await import('./views/Notes')).NotesView
}))

const quickPrompts = [
  'Give me my daily brief',
  'Plan my most important goal',
  'Research voice-first AI',
  'Review investment risk'
]

interface PendingAction {
  proposal: ActionProposal
  execute: () => void | Promise<void>
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function containsSensitiveCloudContext(text: string) {
  return /\b(password|passcode|api key|secret key|private key|access token|refresh token|seed phrase|recovery phrase|credit card|cvv|medical record|bank account)\b/i.test(text) ||
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)
}

function getGreeting(now: Date) {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function loadSkillStates() {
  try {
    const saved = window.localStorage.getItem('era.skills.enabled.v1')
    return saved ? JSON.parse(saved) as Record<string, boolean> : {}
  } catch {
    return {}
  }
}

function loadEnabledAutomations() {
  try {
    const saved = window.localStorage.getItem('era.automations.v1')
    const parsed = saved ? JSON.parse(saved) : ['focus-sprint']
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return ['focus-sprint']
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('console')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [memories, setMemories] = useState<MemoryItem[]>(loadMemories)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(loadAuditLog)
  const [projects, setProjects] = useState<ProjectItem[]>(loadProjects)
  const [watchlist, setWatchlist] = useState<string[]>(loadWatchlist)
  const [reminders, setReminders] = useState<ReminderItem[]>(loadReminders)
  const [settings, setSettings] = useState<EraSettings>(loadSettings)
  const [enabledAutomations, setEnabledAutomations] = useState<string[]>(loadEnabledAutomations)
  const [timers, setTimers] = useState<ActiveTimer[]>([])
  const [activeAgents, setActiveAgents] = useState<AgentId[]>(['voice'])
  const [skillStates, setSkillStates] = useState<Record<string, boolean>>(loadSkillStates)
  const [graphFocus, setGraphFocus] = useState<GraphFocusEvent | null>(null)
  const [input, setInput] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<ConversationAttachment[]>([])
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)
  const [fileNotice, setFileNotice] = useState('')
  const [phase, setPhase] = useState<Exclude<VoiceState, 'listening'>>('idle')
  const [providerConnected, setProviderConnected] = useState(false)
  const [desktopAgentOnline, setDesktopAgentOnline] = useState(false)
  const [agentStatusHistory, setAgentStatusHistory] = useState(['offline'])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [privacyLockActive, setPrivacyLockActive] = useState(false)
  const [memoryWorkspace, setMemoryWorkspace] = useState<'layers' | 'notes'>('notes')
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [visionAnalysis, setVisionAnalysis] = useState('')
  const [visionLoading, setVisionLoading] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const openPalette = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLocaleLowerCase() === 'e') {
        event.preventDefault()
        setCommandPaletteOpen((current) => !current)
      }
    }
    window.addEventListener('keydown', openPalette)
    return () => window.removeEventListener('keydown', openPalette)
  }, [])

  useEffect(() => saveMemories(memories), [memories])
  useEffect(() => saveAuditLog(auditLog), [auditLog])
  useEffect(() => saveProjects(projects), [projects])
  useEffect(() => saveWatchlist(watchlist), [watchlist])
  useEffect(() => saveReminders(reminders), [reminders])
  useEffect(() => saveSettings(settings), [settings])
  useEffect(() => {
    window.localStorage.setItem('era.automations.v1', JSON.stringify(enabledAutomations))
  }, [enabledAutomations])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/health', { signal: controller.signal })
      .then((response) => response.json())
      .then((health: { providerConfigured?: boolean }) =>
        setProviderConnected(Boolean(health.providerConfigured))
      )
      .catch(() => setProviderConnected(false))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!window.electron?.ipcRenderer) return
    window.electron.ipcRenderer.invoke('agent-status')
      .then((status) => {
        const online = Boolean(status && typeof status === 'object' && 'online' in status && status.online)
        setDesktopAgentOnline(online)
        if (online) setAgentStatusHistory((current) => current.includes('online') ? current : [...current, 'online'])
      })
      .catch(() => setDesktopAgentOnline(false))
  }, [])

  const addAudit = useCallback(
    (
      summary: string,
      options: {
        type?: AuditEntry['type']
        status?: AuditEntry['status']
        risk?: RiskLevel
        agents?: AgentId[]
      } = {}
    ) => {
      const entry: AuditEntry = {
        id: createId(),
        summary,
        type: options.type || 'system',
        status: options.status || 'completed',
        risk: options.risk || 'low',
        agents: options.agents || [],
        createdAt: new Date().toISOString()
      }
      setAuditLog((current) => [entry, ...current].slice(0, 200))
    },
    []
  )

  const requestAction = useCallback((proposal: ActionProposal, execute: PendingAction['execute']) => {
    setPendingAction({ proposal, execute })
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!settings.autoSpeak || !('speechSynthesis' in window)) {
        setPhase('idle')
        return
      }

      window.speechSynthesis.cancel()
      const utterance = createEraUtterance(
        text,
        settings,
        window.speechSynthesis.getVoices()
      )
      utterance.onstart = () => setPhase('speaking')
      utterance.onend = () => setPhase('idle')
      utterance.onerror = () => setPhase('idle')
      window.speechSynthesis.speak(utterance)
    },
    [settings]
  )

  const addMemory = useCallback(
    (content: string, layer: MemoryLayer = 'long-term') => {
      if (!settings.memoryEnabled) return false
      setMemories((current) => [
        { id: createId(), content, layer, createdAt: new Date().toISOString() },
        ...current
      ])
      addAudit(`Saved ${layer} memory`, {
        type: 'memory',
        agents: ['memory']
      })
      return true
    },
    [addAudit, settings.memoryEnabled]
  )

  const addAssistantMessage = useCallback(
    (text: string, sources: Array<{ title: string; url: string }> = []) => {
      const message: ConversationMessage = {
        id: createId(),
        role: 'assistant',
        text,
        createdAt: new Date().toISOString(),
        sources
      }
      setMessages((current) => [...current, message])
      return message
    },
    []
  )

  const performAction = useCallback(
    (action: AssistantAction | undefined) => {
      if (!action) return

      if (action.type === 'open-url') {
        window.open(action.url, '_blank', 'noopener,noreferrer')
        addAudit(`Opened ${action.label}`, { type: 'action', agents: ['automation'] })
      }

      if (action.type === 'remember') addMemory(action.content)

      if (action.type === 'show-memories') setActiveTab('memory')

      if (action.type === 'clear-conversation') {
        setMessages([])
        addAudit('Cleared conversation history', { type: 'action' })
      }

      if (action.type === 'create-agent-mission') {
        window.localStorage.setItem('era.agent.pending-mission', action.objective)
        setActiveTab('agents')
        addAudit(`Created multi-agent mission: ${action.objective}`, {
          type: 'action', agents: ['research', 'security', 'planning', 'knowledge']
        })
      }

      if (action.type === 'privacy-lock') {
        window.speechSynthesis?.cancel()
        setPhase('idle')
        setCommandPaletteOpen(false)
        setSettingsOpen(false)
        setSettings((current) => ({ ...current, privacyMode: 'offline', memoryEnabled: false }))
        setPrivacyLockActive(true)
        addAudit('Emergency session privacy lock activated by voice command', {
          type: 'system', status: 'completed', risk: 'high', agents: ['security']
        })
      }

      if (action.type === 'create-reminder') {
        const reminder: ReminderItem = {
          id: createId(),
          content: action.content,
          dueAt: action.dueAt,
          recurrence: action.recurrence,
          completed: false,
          createdAt: new Date().toISOString()
        }
        setReminders((current) => [reminder, ...current])
        addAudit(`Created ${action.recurrence} reminder: ${action.content}`, {
          type: 'action', agents: ['automation']
        })
      }

      if (action.type === 'start-timer') {
        const id = createId()
        const timer: ActiveTimer = {
          id,
          label: action.label,
          endsAt: Date.now() + action.seconds * 1_000
        }
        setTimers((current) => [...current, timer])
        addAudit(`Started ${action.label} timer`, { type: 'action', agents: ['automation'] })
        window.setTimeout(() => {
          setTimers((current) => current.filter((item) => item.id !== id))
          const finished = `Your ${action.label} timer is finished.`
          addAssistantMessage(finished)
          speak(finished)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('ERA timer', { body: finished })
          }
        }, action.seconds * 1_000)
      }
    },
    [addAssistantMessage, addAudit, addMemory, speak]
  )

  useEffect(() => {
    const checkReminders = window.setInterval(() => {
      const currentTime = Date.now()
      const due = reminders.filter((reminder) =>
        !reminder.completed && new Date(reminder.dueAt).getTime() <= currentTime)
      if (!due.length) return

      for (const reminder of due) {
        const announcement = `Gentle reminder: ${reminder.content}`
        addAssistantMessage(announcement)
        addAudit(`Reminder delivered: ${reminder.content}`, {
          type: 'action', agents: ['automation']
        })
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('ERA reminder', { body: reminder.content })
        }
      }

      speak(due.length === 1
        ? `Gentle reminder: ${due[0].content}`
        : `You have ${due.length} reminders: ${due.map((item) => item.content).join('; ')}`)

      setReminders((current) => current.map((reminder) => {
        if (!due.some((item) => item.id === reminder.id)) return reminder
        if (reminder.recurrence === 'none') return { ...reminder, completed: true }
        const interval = reminder.recurrence === 'weekly' ? 7 * 86_400_000 : 86_400_000
        let next = new Date(reminder.dueAt).getTime()
        while (next <= currentTime) next += interval
        return { ...reminder, dueAt: new Date(next).toISOString() }
      }))
    }, 1_000)
    return () => window.clearInterval(checkReminders)
  }, [addAssistantMessage, addAudit, reminders, speak])

  const addDashboardFiles = useCallback(async (incoming: FileList | File[]) => {
    const candidates = Array.from(incoming)
    const accepted: ConversationAttachment[] = []
    let metadataOnly = 0

    for (const file of candidates) {
      const kind = classifyAttachment(file.name, file.type)
      let textContent: string | undefined
      let previewUrl: string | undefined
      if (canReadAsText(kind) && file.size <= 2 * 1_048_576) {
        textContent = await file.text()
      } else if (canReadAsText(kind) && file.size > 2 * 1_048_576) {
        metadataOnly += 1
      }
      if (kind === 'image' && file.size <= 25 * 1_048_576) {
        previewUrl = URL.createObjectURL(file)
      } else if (kind === 'image') {
        metadataOnly += 1
      }
      accepted.push({
        id: createId(),
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        kind,
        ...(textContent !== undefined ? { textContent } : {}),
        ...(previewUrl ? { previewUrl } : {})
      })
    }

    if (accepted.length) setPendingAttachments((current) => [...current, ...accepted])
    setFileNotice(`${accepted.length} file${accepted.length === 1 ? '' : 's'} attached with no attachment-size rejection.${metadataOnly ? ` ${metadataOnly} large file${metadataOnly === 1 ? '' : 's'} kept as metadata-only for safe processing.` : ''}`)
  }, [])

  const addDashboardDrop = useCallback(async (dataTransfer: DataTransfer) => {
    const directories: ConversationAttachment[] = []
    const looseFiles: File[] = []
    const items = Array.from(dataTransfer.items || [])

    if (items.length) {
      for (const item of items) {
        if (item.kind !== 'file') continue
        const entry = entryFromDataTransferItem(item)
        if (entry?.isDirectory) {
          try {
            directories.push(await summarizeDroppedDirectory(entry, createId))
          } catch {
            directories.push({
              id: createId(),
              name: entry.name,
              mimeType: 'inode/directory',
              size: 0,
              kind: 'folder',
              fileCount: 0,
              samplePaths: []
            })
          }
        } else {
          const file = item.getAsFile()
          if (file) looseFiles.push(file)
        }
      }
    } else {
      looseFiles.push(...Array.from(dataTransfer.files || []))
    }

    if (looseFiles.length) await addDashboardFiles(looseFiles)
    if (directories.length) {
      setPendingAttachments((current) => [...current, ...directories])
      const fileCount = directories.reduce((total, folder) => total + (folder.fileCount || 0), 0)
      const totalSize = directories.reduce((total, folder) => total + folder.size, 0)
      setFileNotice(`${directories.length} folder${directories.length === 1 ? '' : 's'} attached as local manifests: ${fileCount.toLocaleString()} files, ${formatFileSize(totalSize)} total. No folder-size rejection; contents are not uploaded automatically.`)
    }
  }, [addDashboardFiles])

  const removeDashboardFile = useCallback((id: string) => {
    setPendingAttachments((current) => {
      const removed = current.find((attachment) => attachment.id === id)
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      return current.filter((attachment) => attachment.id !== id)
    })
  }, [])

  const handleRequest = useCallback(
    async (rawInput: string, suppliedAttachments: ConversationAttachment[] = []) => {
      const text = rawInput.trim()
      if ((!text && suppliedAttachments.length === 0) || phase === 'thinking' || privacyLockActive) return
      const displayText = text || `Attached ${suppliedAttachments.length} file${suppliedAttachments.length === 1 ? '' : 's'}`
      const fileContext = attachmentContext(suppliedAttachments)
      const providerText = fileContext
        ? `${text || 'Review the attached file metadata.'}\n\nAttached local context:\n${fileContext}`
        : text

      window.speechSynthesis?.cancel()
      setInput('')
      setActiveTab('console')
      setPhase('thinking')

      const route = routeRequest(text || 'review attached files')
      setActiveAgents(route.agents)
      addAudit(`Routed request for ${route.intent}`, {
        type: 'request',
        risk: route.risk,
        agents: route.agents
      })

      const userMessage: ConversationMessage = {
        id: createId(),
        role: 'user',
        text: displayText,
        createdAt: new Date().toISOString(),
        ...(suppliedAttachments.length ? { attachments: suppliedAttachments } : {})
      }
      setMessages((current) => [...current, userMessage])
      if (suppliedAttachments.length) {
        addAudit(`Attached ${suppliedAttachments.length} local file${suppliedAttachments.length === 1 ? '' : 's'} to transcript`, {
          type: 'action', agents: ['security']
        })
      }

      const controllingSkill = matchBuiltInSkill(text)
      if (controllingSkill && skillStates[controllingSkill.id] === false) {
        const disabledReply = `The ${controllingSkill.name} skill is disabled. You can re-enable it from the Skills library.`
        addAssistantMessage(disabledReply)
        addAudit(`Blocked disabled skill: ${controllingSkill.name}`, {
          type: 'action', status: 'blocked', risk: controllingSkill.risk, agents: ['security']
        })
        speak(disabledReply)
        return
      }

      const languageRequest = text.match(/^(?:(?:switch|change|set)(?: the)? (?:voice )?language to|speak in)\s+(.+)/i)
      if (languageRequest) {
        try {
          const requestedName = languageRequest[1].trim()
          const response = await fetch(`/api/languages?q=${encodeURIComponent(requestedName)}&limit=20`)
          const body = await response.json()
          const options = Array.isArray(body.results) ? body.results as Array<{ name: string; speechTag: string; voiceSupport: string }> : []
          const selected = options.find((option) => option.name.toLocaleLowerCase() === requestedName.toLocaleLowerCase()) || options[0]
          if (!selected) throw new Error('Language not found')
          setSettings((current) => ({ ...current, language: selected.speechTag }))
          const reply = `Voice language changed to ${selected.name} using ${selected.speechTag}. Actual recognition and speech availability still depend on this browser and the voices installed on your device.`
          addAssistantMessage(reply)
          addAudit(`Voice language changed to ${selected.name}`, { type: 'system', agents: ['voice'] })
          speak(reply)
        } catch {
          const reply = 'I couldn’t find that language in the local ISO catalog. Try the language name or ISO code in Settings.'
          addAssistantMessage(reply)
          speak(reply)
        }
        return
      }

      const local = suppliedAttachments.length
        ? { handled: false, action: undefined, response: undefined }
        : runLocalCommand(text)
      const isMemoryCapture = local.action?.type === 'remember'
      const memoryPaused = isMemoryCapture && (!settings.memoryEnabled || settings.privacyMode === 'temporary')
      const clearNeedsApproval = local.action?.type === 'clear-conversation'
      let captureReply: string | undefined

      if (clearNeedsApproval) {
        requestAction(
          {
            title: 'Clear conversation history?',
            purpose: 'Remove the messages from this active ERA session.',
            impact: 'This cannot be undone. Saved memory layers and projects will not be affected.',
            steps: ['Stop any spoken response', 'Remove current conversation messages', 'Keep saved memory and OS data unchanged'],
            risk: 'medium',
            confirmLabel: 'Clear conversation'
          },
          () => {
            setMessages([])
            setPhase('idle')
            addAudit('Cleared conversation history', { type: 'action', risk: 'medium', agents: ['security'] })
          }
        )
      } else if (isMemoryCapture && !memoryPaused && local.action?.type === 'remember') {
        try {
          const candidates = [
            ...projects.map((project) => ({
              id: project.id,
              text: `${project.title} ${project.objective}`
            })),
            ...memories.map((memory) => ({ id: memory.id, text: memory.content }))
          ]
          const related = findMostRelatedNode(local.action.content, candidates)
          const note = await rememberInNotes(local.action.content)
          const capturedMemory: MemoryItem = {
            id: note.id,
            content: note.content,
            createdAt: note.createdAt,
            layer: 'long-term'
          }
          setMemories((current) => [capturedMemory, ...current.filter((item) => item.id !== note.id)])
          setActiveAgents(['memory', 'knowledge', 'voice'])
          setGraphFocus({
            nodeId: note.id,
            relatedNodeId: related.id,
            nonce: Date.now()
          })
          setActiveTab('os')
          addAudit(`Captured markdown memory: ${note.title}`, {
            type: 'memory',
            agents: ['memory', 'knowledge']
          })
          captureReply = `Tiny brain bloom complete—“${note.title}” just found a cozy new neuron.`
        } catch (error) {
          const sensitive = error instanceof Error && error.name === 'SENSITIVE_MEMORY_REJECTED'
          captureReply = sensitive
            ? 'That looks too sensitive for memory, so I kept it out of your notes. Your secrets deserve better hiding places.'
            : 'My memory pen slipped, so I couldn’t write that note. Please check the notes directory and try once more.'
          addAudit('Markdown memory capture failed', {
            type: 'memory',
            status: 'failed',
            agents: ['memory', 'security']
          })
        }
      } else if (!memoryPaused) {
        performAction(local.action)
      }

      let sources: Array<{ title: string; url: string }> = []
      let reply = memoryPaused
        ? 'Memory is currently paused. Turn it on in Memory or Settings, then ask me to save that again.'
        : clearNeedsApproval
          ? 'I’ve prepared the deletion request. Review the impact and approve it if you want to continue.'
          : captureReply || local.response

      if (local.handled) {
        await new Promise((resolve) => window.setTimeout(resolve, 360))
      } else if (settings.privacyMode === 'offline') {
        reply = 'Offline privacy mode is active, so I kept this request on your device. Local commands still work, and you can change the mode in Settings when you want connected reasoning.'
        addAudit('Blocked AI request in offline privacy mode', {
          type: 'request', status: 'blocked', risk: route.risk, agents: ['security']
        })
      } else if (settings.privacyMode === 'balanced' && containsSensitiveCloudContext(providerText)) {
        reply = 'I found sensitive-looking information, so the context firewall kept it away from external AI providers. Remove the secret or deliberately switch privacy mode after reviewing the request.'
        addAudit('Context firewall blocked sensitive provider request', {
          type: 'request', status: 'blocked', risk: 'high', agents: ['security']
        })
      } else {
        try {
          const conversationForProvider = [
            ...messages.slice(-9).map(({ role, text: messageText }) => ({ role, text: messageText })),
            { role: 'user' as const, text: providerText }
          ]
          const cloudResponse = await askCloudAssistant(
            conversationForProvider,
            { agents: route.agents, risk: route.risk, language: settings.language }
          )
          reply = cloudResponse.text
          sources = cloudResponse.sources
        } catch (error) {
          const notConfigured = error instanceof Error && error.name === 'PROVIDER_NOT_CONFIGURED'
          reply = notConfigured
            ? 'The Persona orchestration layer understood your request, but connected reasoning is not configured yet. Add an AI provider, or use a local command such as a timer, calculation, memory, search, or approved website.'
            : 'I’m having trouble reaching the reasoning service. Local commands and the Persona OS workspace are still available.'
          addAudit('AI provider request failed', {
            type: 'request',
            status: 'failed',
            risk: route.risk,
            agents: route.agents
          })
        }
      }

      const finalReply = reply || 'Done.'
      addAssistantMessage(finalReply, sources)
      speak(finalReply)
    },
    [addAssistantMessage, addAudit, memories, messages, performAction, phase, privacyLockActive, projects, requestAction, settings.memoryEnabled, settings.privacyMode, skillStates, speak]
  )

  const {
    error: voiceError,
    interimTranscript,
    isListening,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    clearError
  } = useSpeechRecognition({
    language: settings.language,
    onFinalTranscript: handleRequest
  })

  useEffect(() => {
    if (privacyLockActive) stopListening()
  }, [privacyLockActive, stopListening])

  const voiceState: VoiceState = isListening ? 'listening' : phase

  const toggleVoice = useCallback(() => {
    clearError()
    if (isListening) {
      stopListening()
      return
    }
    if (phase === 'speaking') {
      window.speechSynthesis.cancel()
      setPhase('idle')
      return
    }
    if (phase !== 'thinking') startListening()
  }, [clearError, isListening, phase, startListening, stopListening])

  const activatePrivacyLock = useCallback(() => {
    window.speechSynthesis?.cancel()
    stopListening()
    setPhase('idle')
    setCommandPaletteOpen(false)
    setSettingsOpen(false)
    setSettings((current) => ({
      ...current,
      privacyMode: 'offline',
      memoryEnabled: false
    }))
    setPrivacyLockActive(true)
    addAudit('Emergency session privacy lock activated', {
      type: 'system', status: 'completed', risk: 'high', agents: ['security']
    })
  }, [addAudit, stopListening])

  const clearConversation = useCallback(() => {
    window.speechSynthesis?.cancel()
    for (const message of messages) {
      for (const attachment of message.attachments || []) {
        if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl)
      }
    }
    for (const attachment of pendingAttachments) {
      if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl)
    }
    setMessages([])
    setPendingAttachments([])
    setPhase('idle')
    setSettingsOpen(false)
    addAudit('Cleared conversation history', { type: 'action' })
  }, [addAudit, messages, pendingAttachments])

  const requestClearConversation = useCallback(() => {
    setSettingsOpen(false)
    requestAction(
      {
        title: 'Clear conversation history?',
        purpose: 'Remove the messages from this active ERA session.',
        impact: 'This cannot be undone. Saved memory layers and projects will not be affected.',
        steps: ['Stop any spoken response', 'Remove current conversation messages', 'Keep saved memory and OS data unchanged'],
        risk: 'medium',
        confirmLabel: 'Clear conversation'
      },
      clearConversation
    )
  }, [clearConversation, requestAction])

  const requestAutomation = useCallback(
    (automation: AutomationDefinition) => {
      requestAction(
        {
          title: `Run “${automation.title}”?`,
          purpose: automation.description,
          impact: automation.id === 'focus-sprint'
            ? 'A local timer will start and ERA will notify you when it ends.'
            : 'ERA will prepare guidance from available context. No external service is modified.',
          steps: automation.steps,
          risk: 'low',
          confirmLabel: 'Run workflow'
        },
        () => {
          addAudit(`Approved ${automation.title} workflow`, {
            type: 'action',
            agents: ['automation']
          })
          void handleRequest(automation.prompt)
        }
      )
    },
    [addAudit, handleRequest, requestAction]
  )

  const requestVisionAnalysis = useCallback(
    (request: VisionRequest) => {
      requestAction(
        {
          title: `Analyze “${request.filename}”?`,
          purpose: 'Send only this selected image to the configured Gemini vision model for analysis.',
          impact: 'The image leaves this browser for processing. ERA does not save the image to local memory.',
          steps: ['Validate the selected image', 'Send it securely to the vision provider', 'Return visible observations and clearly marked recommendations'],
          risk: 'medium',
          confirmLabel: 'Send and analyze'
        },
        async () => {
          setVisionLoading(true)
          setVisionAnalysis('')
          setActiveAgents(['screen', 'security', 'knowledge', 'voice'])
          try {
            const result = await analyzeImage(request.image, request.prompt)
            setVisionAnalysis(result)
            addAudit(`Analyzed ${request.filename}`, {
              type: 'vision',
              risk: 'medium',
              agents: ['screen', 'security', 'knowledge']
            })
          } catch (error) {
            setVisionAnalysis(
              error instanceof Error
                ? error.message
                : 'ERA could not analyze this image. Please try again.'
            )
            addAudit(`Vision analysis failed for ${request.filename}`, {
              type: 'vision',
              status: 'failed',
              risk: 'medium',
              agents: ['screen', 'security']
            })
          } finally {
            setVisionLoading(false)
          }
        }
      )
    },
    [addAudit, requestAction]
  )

  const addProject = useCallback(
    (title: string, objective: string) => {
      setProjects((current) => [
        { id: createId(), title, objective, status: 'active', createdAt: new Date().toISOString() },
        ...current
      ])
      addAudit(`Created project: ${title}`, { type: 'action', agents: ['planning'] })
    },
    [addAudit]
  )

  const deleteProject = useCallback(
    (id: string) => {
      const project = projects.find((item) => item.id === id)
      if (!project) return
      requestAction(
        {
          title: `Delete “${project.title}”?`,
          purpose: 'Remove this project and its objective from the local Persona workspace.',
          impact: 'The project record will be permanently removed. Conversation and memory remain unchanged.',
          steps: ['Verify the selected project', 'Remove the local project record', 'Record the deletion in the audit log'],
          risk: 'medium',
          confirmLabel: 'Delete project'
        },
        () => {
          setProjects((current) => current.filter((item) => item.id !== id))
          addAudit(`Deleted project: ${project.title}`, {
            type: 'action',
            risk: 'medium',
            agents: ['planning', 'security']
          })
        }
      )
    },
    [addAudit, projects, requestAction]
  )

  const confirmPendingAction = useCallback(() => {
    if (!pendingAction) return
    const execute = pendingAction.execute
    setPendingAction(null)
    void execute()
  }, [pendingAction])

  const submitDashboardMessage = useCallback(() => {
    const attachments = pendingAttachments
    setPendingAttachments([])
    setFileNotice('')
    void handleRequest(input, attachments)
  }, [handleRequest, input, pendingAttachments])

  return (
    <div className={menuOpen ? 'app-shell reference-shell menu-open' : 'app-shell reference-shell'}>
      <div className="background-grid" aria-hidden="true" />
      <Sidebar
        activeTab={activeTab}
        memoryCount={memories.length}
        providerConnected={providerConnected}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setMenuOpen(false)
        }}
      />
      {menuOpen && <button type="button" className="reference-menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}

      <div className="app-main">
        <Titlebar
          activeTab={activeTab}
          settingsOpen={settingsOpen}
          onToggleMenu={() => setMenuOpen((current) => !current)}
          onNavigate={setActiveTab}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <main className="content-area">
          {activeTab === 'console' && (
            <Dashboard
              isDraggingFiles={isDraggingFiles}
              onDragEnter={(event) => { event.preventDefault(); setIsDraggingFiles(true) }}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy' }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDraggingFiles(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setIsDraggingFiles(false)
                if (event.dataTransfer.items.length || event.dataTransfer.files.length) void addDashboardDrop(event.dataTransfer)
              }}
            >
              {isDraggingFiles && <div className="dashboard-drop-overlay"><FileAttachmentIcon kind="folder" size={31} /><strong>DROP FILES OR FOLDERS INTO AERA</strong><span>Folders of any total size plus images, text, code, data, documents, audio, video, archives, and other files</span></div>}
              <aside className="reference-left-rail">
                <div className="hologram-module">
                  <div className="hologram-cone" />
                  <div className="hologram-rings"><span /><span /><span /></div>
                  <small>Hologram</small>
                </div>

                <section className="reference-info-card">
                  <header>SYSTEM INFO</header>
                  <div data-testid="agent-status" data-history={agentStatusHistory.join(',')}><span><Wifi size={12} /> Agent</span><strong>{desktopAgentOnline ? 'Agent Online' : 'Agent Offline'}</strong></div>
                  <div><span><Cpu size={12} /> Persona</span><strong>v0.7</strong></div>
                  <div><span><MemoryStick size={12} /> Memories</span><strong>{memories.length}</strong></div>
                  <div><span><BellRing size={12} /> Reminders</span><strong>{reminders.filter((reminder) => !reminder.completed).length}</strong></div>
                  <div><span><Clock3 size={12} /> Time</span><strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
                  {timers.length > 0 && <div className="info-timer"><span><BellRing size={12} /> Timer</span><strong>{timers[0].label}</strong></div>}
                </section>

                <section className="reference-workspace-card">
                  <header><span><Folder size={12} /> WORKSPACE</span><i>{projects.length}</i></header>
                  <div className="workspace-tree">
                    <span className="workspace-root"><Folder size={12} /> ERA Workspace</span>
                    {projects.length === 0
                      ? <small>› Default</small>
                      : projects.slice(0, 5).map((project) => <small key={project.id}>› {project.title}</small>)}
                  </div>
                </section>

                <section className="reference-alert-card">
                  <header><AlertCircle size={12} /> LAST EVENT</header>
                  <p>{auditLog[0]?.summary || 'No system events yet.'}</p>
                  <span>{auditLog[0]?.status || 'standby'}</span>
                </section>
              </aside>

              <section className="reference-command-center">
                <div className="reference-center-status">
                  <span>{getGreeting(now)}</span>
                  <strong>{voiceState === 'listening' ? 'I’m listening.' : voiceState === 'thinking' ? 'Thinking softly…' : 'How can I help?'}</strong>
                </div>
                <ParticleVoiceCore state={voiceState} supported={voiceSupported} onToggle={toggleVoice} />
                <div className="reference-agent-strip">
                  {activeAgents.map((agent) => <span key={agent}>{agentById(agent)?.shortName}</span>)}
                </div>
                <button type="button" className={isListening ? 'reference-speak-button active' : 'reference-speak-button'} onClick={toggleVoice} disabled={!voiceSupported}>
                  {isListening ? 'STOP LISTENING' : 'TAP TO SPEAK'}
                </button>
                <div className="reference-bottom-brand" aria-label="AERA AI"><span>AERA AI</span></div>
                <small className="reference-core-note">Voice · Memory · Intelligence</small>
              </section>

              <aside className="reference-transcript-panel">
                <header><span>Transcript</span><i>{phase === 'thinking' ? 'PROCESSING' : 'LIVE'}</i></header>
                <div className="reference-transcript-scroll" aria-live="polite">
                  {messages.length === 0 && !interimTranscript ? (
                    <div className="reference-transcript-empty"><span>•••</span><div className="transcript-brand-watermark"><img src="/brand/era-vision-core.webp" alt="" /><strong>AERA AI</strong></div><p>Your conversation with ERA will appear here.</p></div>
                  ) : (
                    <>
                      {messages.slice(-10).map((message) => (
                        <article className={message.role} key={message.id}>
                          <span>{message.role === 'assistant' ? 'ERA' : 'YOU'}</span>
                          <p>{message.text}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="transcript-attachments">
                              {message.attachments.map((attachment) => (
                                <span key={attachment.id} title={`${attachment.name}${attachment.fileCount !== undefined ? ` · ${attachment.fileCount.toLocaleString()} files` : ''} · ${formatFileSize(attachment.size)}`}>
                                  {attachment.kind === 'image' && attachment.previewUrl
                                    ? <img src={attachment.previewUrl} alt={attachment.name} />
                                    : <FileAttachmentIcon kind={attachment.kind} size={13} />}
                                  <b>{attachment.name}</b>
                                </span>
                              ))}
                            </div>
                          )}
                          {message.sources && message.sources.length > 0 && (
                            <div>{message.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.title}</a>)}</div>
                          )}
                        </article>
                      ))}
                      {interimTranscript && <article className="user interim"><span>YOU · LISTENING</span><p>{interimTranscript}</p></article>}
                    </>
                  )}
                </div>
                {pendingAttachments.length > 0 && (
                  <div className="pending-attachment-tray">
                    {pendingAttachments.map((attachment) => (
                      <div key={attachment.id}>
                        {attachment.kind === 'image' && attachment.previewUrl
                          ? <img src={attachment.previewUrl} alt="" />
                          : <span><FileAttachmentIcon kind={attachment.kind} size={14} /></span>}
                        <p><strong>{attachment.name}</strong><small>{attachment.kind}{attachment.fileCount !== undefined ? ` · ${attachment.fileCount.toLocaleString()} files` : ''} · {formatFileSize(attachment.size)}</small></p>
                        <button type="button" onClick={() => removeDashboardFile(attachment.id)} aria-label={`Remove ${attachment.name}`}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {fileNotice && <div className="file-attachment-notice">{fileNotice}</div>}
                <div className="reference-prompt-chips">
                  {quickPrompts.slice(0, 2).map((prompt) => <button type="button" key={prompt} onClick={() => void handleRequest(prompt)}>{prompt}</button>)}
                </div>
                <Composer
                  value={input}
                  isBusy={phase === 'thinking'}
                  isListening={isListening}
                  voiceSupported={voiceSupported}
                  attachmentCount={pendingAttachments.length}
                  onChange={setInput}
                  onSubmit={submitDashboardMessage}
                  onVoiceToggle={toggleVoice}
                  onFiles={(files) => void addDashboardFiles(files)}
                />
              </aside>
            </Dashboard>
          )}

          {activeTab === 'apps' && <AppsView />}

          {activeTab === 'skills' && (
            <SkillsView
              onPrompt={(prompt) => void handleRequest(prompt)}
              onStatesChange={setSkillStates}
            />
          )}

          {activeTab === 'agents' && (
            <AgentTasksView
              providerConnected={providerConnected}
              privacyMode={settings.privacyMode}
              language={settings.language}
            />
          )}

          {activeTab === 'os' && (
            <IntelligenceView
              providerConnected={providerConnected}
              memoryCount={memories.length}
              memories={memories}
              auditLog={auditLog}
              projects={projects}
              watchlist={watchlist}
              activeAgents={activeAgents}
              graphFocus={graphFocus}
              visionAnalysis={visionAnalysis}
              visionLoading={visionLoading}
              onPrompt={(prompt) => void handleRequest(prompt)}
              onAddProject={addProject}
              onUpdateProject={(id, status) => {
                setProjects((current) => current.map((project) => project.id === id ? { ...project, status } : project))
                addAudit(`Updated project status to ${status}`, { type: 'action', agents: ['planning'] })
              }}
              onDeleteProject={deleteProject}
              onAddWatchSymbol={(symbol) => setWatchlist((current) => current.includes(symbol) ? current : [...current, symbol])}
              onRemoveWatchSymbol={(symbol) => setWatchlist((current) => current.filter((item) => item !== symbol))}
              onVisionRequest={requestVisionAnalysis}
              onClearAudit={() => requestAction(
                {
                  title: 'Clear the audit log?',
                  purpose: 'Remove locally stored action and orchestration history.',
                  impact: 'Audit entries will be permanently removed. Projects, memories, and conversations are unaffected.',
                  steps: ['Verify the deletion request', 'Remove local audit entries', 'Keep all other workspace data unchanged'],
                  risk: 'medium',
                  confirmLabel: 'Clear audit log'
                },
                () => setAuditLog([])
              )}
            />
          )}

          {activeTab === 'automations' && (
            <div className="macro-workspace">
              <AutomationsView
                enabled={enabledAutomations}
                onToggle={(id) => setEnabledAutomations((current) =>
                  current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
                )}
                onRun={requestAutomation}
              />
              <ReminderDock
                reminders={reminders}
                onAdd={(content, dueAt) => {
                  setReminders((current) => [{
                    id: createId(), content, dueAt, recurrence: 'none', completed: false,
                    createdAt: new Date().toISOString()
                  }, ...current])
                  addAudit(`Created reminder: ${content}`, { type: 'action', agents: ['automation'] })
                }}
                onDelete={(id) => setReminders((current) => current.filter((reminder) => reminder.id !== id))}
              />
            </div>
          )}

          {activeTab === 'gallery' && <GalleryView />}

          {activeTab === 'phone' && <PhoneView />}

          {activeTab === 'memory' && (
            <div className="memory-workspace-container">
              <nav className="memory-workspace-tabs">
                <button type="button" className={memoryWorkspace === 'notes' ? 'active' : ''} onClick={() => setMemoryWorkspace('notes')}>Markdown Bank</button>
                <button type="button" className={memoryWorkspace === 'layers' ? 'active' : ''} onClick={() => setMemoryWorkspace('layers')}>Memory Layers</button>
              </nav>
              {memoryWorkspace === 'notes' ? (
                <Suspense fallback={<div className="notes-loading">Loading Markdown bank…</div>}><NotesView /></Suspense>
              ) : <MemoryView
              memories={memories}
              enabled={settings.memoryEnabled}
              workingMemoryCount={messages.length}
              onToggleEnabled={() => setSettings((current) => ({ ...current, memoryEnabled: !current.memoryEnabled }))}
              onAdd={addMemory}
              onDelete={(id) => {
                const memory = memories.find((item) => item.id === id)
                if (!memory) return
                requestAction(
                  {
                    title: 'Forget this memory?',
                    purpose: 'Remove this saved detail from Persona memory.',
                    impact: 'The selected memory will be permanently deleted from this browser.',
                    steps: ['Verify the selected memory', 'Delete only this memory', 'Record the action locally'],
                    risk: 'medium',
                    confirmLabel: 'Forget memory'
                  },
                  () => {
                    setMemories((current) => current.filter((item) => item.id !== id))
                    addAudit('Deleted a saved memory', { type: 'memory', risk: 'medium', agents: ['memory', 'security'] })
                  }
                )
              }}
              onClear={() => requestAction(
                {
                  title: 'Clear all Persona memories?',
                  purpose: 'Remove long-term, semantic, and episodic memories saved in this browser.',
                  impact: 'All saved memories will be permanently deleted. Projects and conversations remain unchanged.',
                  steps: ['Count the affected memories', 'Delete all three persistent memory layers', 'Keep working conversation and projects unchanged'],
                  risk: 'high',
                  confirmLabel: 'Clear all memories'
                },
                () => {
                  setMemories([])
                  addAudit('Cleared all persistent memory', { type: 'memory', risk: 'high', agents: ['memory', 'security'] })
                }
              )}
            />}
            </div>
          )}
        </main>
      </div>

      {voiceError && (
        <div className="toast" role="alert">
          <CloudOff size={17} /><span>{voiceError}</span><button type="button" onClick={clearError}>Dismiss</button>
        </div>
      )}

      {timers.length > 0 && (
        <div className="timer-float" aria-live="polite">
          <BellRing size={15} /><span>{timers.length} active {timers.length === 1 ? 'timer' : 'timers'}</span>
        </div>
      )}

      {!voiceSupported && activeTab === 'console' && (
        <div className="browser-note"><Bot size={14} /> Type to chat, or open in Chrome/Edge for voice input.</div>
      )}

      {privacyLockActive && (
        <div className="privacy-lock-screen" role="dialog" aria-modal="true" aria-label="ERA privacy lock">
          <div><LockKeyhole size={34} /><span>SESSION PRIVACY LOCK</span><h2>ERA is locally paused.</h2><p>Voice capture, connected AI requests, memory writes, and command overlays are blocked. Provider keys remain encrypted in the server vault.</p><button type="button" onClick={() => setPrivacyLockActive(false)}>Unlock local session</button><small>Unlocking does not automatically re-enable cloud or memory settings.</small></div>
        </div>
      )}

      {commandPaletteOpen && !privacyLockActive && (
        <CommandPalette
          memories={memories}
          projects={projects}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(tab) => setActiveTab(tab)}
          onPrompt={(prompt) => void handleRequest(prompt)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          providerConnected={providerConnected}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
          onClearConversation={requestClearConversation}
          onPrivacyLock={activatePrivacyLock}
          onProviderStatusChange={setProviderConnected}
        />
      )}

      {pendingAction && (
        <ActionConfirmationModal
          proposal={pendingAction.proposal}
          onConfirm={confirmPendingAction}
          onCancel={() => {
            addAudit(`Cancelled: ${pendingAction.proposal.title}`, {
              type: 'action',
              status: 'blocked',
              risk: pendingAction.proposal.risk,
              agents: ['security']
            })
            setPendingAction(null)
          }}
        />
      )}
    </div>
  )
}

export default App
