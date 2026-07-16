import { describe, expect, it } from 'vitest'
import { routeRequest } from './orchestrator'

describe('routeRequest', () => {
  it('uses the knowledge and voice agents for general questions', () => {
    expect(routeRequest('Explain photosynthesis').agents).toEqual(['knowledge', 'voice'])
  })

  it('adds research and security to financial analysis', () => {
    const route = routeRequest('Research the risk in my stock portfolio')
    expect(route.agents).toEqual(expect.arrayContaining(['finance', 'research', 'security', 'voice']))
  })

  it('selects the planning agent for roadmap requests', () => {
    expect(routeRequest('Create a project roadmap').agents).toContain('planning')
  })

  it('requires confirmation for consequential actions', () => {
    const route = routeRequest('Send an email to the whole team')
    expect(route.risk).toBe('high')
    expect(route.requiresConfirmation).toBe(true)
  })

  it('marks uploads as medium risk without blocking analysis', () => {
    const route = routeRequest('Upload this screenshot for OCR')
    expect(route.risk).toBe('medium')
    expect(route.agents).toContain('screen')
  })
})
