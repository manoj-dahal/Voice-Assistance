import { describe, expect, it } from 'vitest'
import {
  builtInSkills,
  manifestToSkill,
  roadmapSkills,
  matchBuiltInSkill,
  validateSkillManifest
} from './skills'

describe('ERA skills engine', () => {
  it('ships unique built-in skills with explicit permissions and steps', () => {
    expect(builtInSkills.length).toBeGreaterThanOrEqual(14)
    expect(new Set(builtInSkills.map((skill) => skill.id)).size).toBe(builtInSkills.length)
    expect(builtInSkills.every((skill) => Array.isArray(skill.permissions) && skill.steps.length > 0)).toBe(true)
  })

  it('registers every vision and ecosystem target as an honest non-operational roadmap skill', () => {
    expect(roadmapSkills).toHaveLength(249)
    expect(new Set(roadmapSkills.map((skill) => skill.id)).size).toBe(249)
    expect(roadmapSkills.every((skill) =>
      skill.source === 'roadmap' && skill.status !== 'available'
    )).toBe(true)
  })

  it('matches deterministic commands to their controlling skill', () => {
    expect(matchBuiltInSkill('Remember that my project uses TypeScript')?.id).toBe('memory-capture')
    expect(matchBuiltInSkill('Start a 25 minute timer')?.id).toBe('timer')
    expect(matchBuiltInSkill('Calculate (12 + 8) / 4')?.id).toBe('safe-calculator')
    expect(matchBuiltInSkill('Switch language to Nepali')?.id).toBe('language-switch')
  })

  it('validates a permission-scoped MCP manifest', () => {
    const manifest = validateSkillManifest({
      schemaVersion: 1,
      id: 'com.example.calendar',
      name: 'Calendar Reader',
      description: 'Reads approved calendars',
      source: 'mcp',
      version: '1.0.0',
      triggers: ['show my calendar'],
      permissions: ['calendar.read'],
      risk: 'medium',
      requiresConfirmation: false,
      tools: ['calendar.list'],
      endpoint: 'http://localhost:3001'
    })
    expect(manifest.endpoint).toBe('http://localhost:3001')
    expect(manifestToSkill(manifest).status).toBe('adapter-required')
  })

  it('rejects unknown permissions and unconfirmed high-impact skills', () => {
    const base = {
      schemaVersion: 1,
      id: 'com.example.sender',
      name: 'Sender',
      description: 'Sends something',
      source: 'plugin',
      version: '1.0.0',
      triggers: ['send now'],
      risk: 'high',
      tools: ['send']
    }
    expect(() => validateSkillManifest({
      ...base,
      permissions: ['email.send'],
      requiresConfirmation: false
    })).toThrow(/require confirmation/)
    expect(() => validateSkillManifest({
      ...base,
      permissions: ['root.everything'],
      requiresConfirmation: true
    })).toThrow(/unknown permission/)
  })
})
