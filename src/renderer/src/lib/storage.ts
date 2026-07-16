import type { AgentId, RiskLevel } from './orchestrator'

export type MemoryLayer = 'long-term' | 'semantic' | 'episodic'

export interface MemoryItem {
  id: string
  content: string
  createdAt: string
  layer: MemoryLayer
}

export interface EraSettings {
  autoSpeak: boolean
  language: string
  selectedVoice: string
  voiceStyle: 'anime-soft' | 'natural'
  memoryEnabled: boolean
  privacyMode: 'cloud' | 'balanced' | 'offline' | 'temporary'
  proactivity: 'silent' | 'important' | 'balanced'
}

export interface AuditEntry {
  id: string
  type: 'request' | 'action' | 'memory' | 'vision' | 'system'
  summary: string
  status: 'completed' | 'pending' | 'blocked' | 'failed'
  risk: RiskLevel
  agents: AgentId[]
  createdAt: string
}

export interface ProjectItem {
  id: string
  title: string
  objective: string
  status: 'active' | 'paused' | 'completed'
  createdAt: string
}

export interface ReminderItem {
  id: string
  content: string
  dueAt: string
  recurrence: 'none' | 'daily' | 'weekly'
  completed: boolean
  createdAt: string
}

const MEMORY_KEY = 'era.memories.v1'
const SETTINGS_KEY = 'era.settings.v1'
const AUDIT_KEY = 'era.audit.v1'
const PROJECTS_KEY = 'era.projects.v1'
const WATCHLIST_KEY = 'era.finance.watchlist.v1'
const REMINDERS_KEY = 'era.reminders.v1'

export const defaultSettings: EraSettings = {
  autoSpeak: true,
  language: 'en-US',
  selectedVoice: '',
  voiceStyle: 'anime-soft',
  memoryEnabled: true,
  privacyMode: 'balanced',
  proactivity: 'important'
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function loadMemories(): MemoryItem[] {
  const memories = readJson<Array<Partial<MemoryItem>>>(MEMORY_KEY, [])
  return Array.isArray(memories)
    ? memories
        .filter((item) => item && typeof item.content === 'string' && item.content.trim())
        .map((item) => ({
          id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          content: item.content as string,
          createdAt: item.createdAt || new Date().toISOString(),
          layer:
            item.layer === 'semantic' || item.layer === 'episodic' ? item.layer : 'long-term'
        }))
    : []
}

export function saveMemories(memories: MemoryItem[]) {
  window.localStorage.setItem(MEMORY_KEY, JSON.stringify(memories))
}

export function loadSettings(): EraSettings {
  return { ...defaultSettings, ...readJson<Partial<EraSettings>>(SETTINGS_KEY, {}) }
}

export function saveSettings(settings: EraSettings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadAuditLog(): AuditEntry[] {
  const entries = readJson<AuditEntry[]>(AUDIT_KEY, [])
  return Array.isArray(entries) ? entries : []
}

export function saveAuditLog(entries: AuditEntry[]) {
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify(entries.slice(0, 200)))
}

export function loadProjects(): ProjectItem[] {
  const projects = readJson<ProjectItem[]>(PROJECTS_KEY, [])
  return Array.isArray(projects) ? projects : []
}

export function saveProjects(projects: ProjectItem[]) {
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function loadWatchlist(): string[] {
  const symbols = readJson<string[]>(WATCHLIST_KEY, ['NVDA', 'MSFT'])
  return Array.isArray(symbols) ? symbols.filter((symbol) => typeof symbol === 'string') : []
}

export function saveWatchlist(symbols: string[]) {
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols))
}

export function loadReminders(): ReminderItem[] {
  const reminders = readJson<ReminderItem[]>(REMINDERS_KEY, [])
  return Array.isArray(reminders)
    ? reminders.filter((reminder) =>
        reminder && typeof reminder.content === 'string' && typeof reminder.dueAt === 'string')
    : []
}

export function saveReminders(reminders: ReminderItem[]) {
  window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders.slice(0, 500)))
}
