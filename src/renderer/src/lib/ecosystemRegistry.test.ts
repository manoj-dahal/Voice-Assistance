import { describe, expect, it } from 'vitest'
import {
  currentConnectorCount,
  ecosystemCategories,
  minimumTargetConnectors
} from './ecosystemRegistry'

describe('ecosystem registry', () => {
  it('contains all 35 requested integration categories with unique ids', () => {
    expect(ecosystemCategories).toHaveLength(35)
    expect(new Set(ecosystemCategories.map((category) => category.id)).size).toBe(35)
    expect(minimumTargetConnectors).toBe(1165)
  })

  it('defines authorization, approval, and a first milestone for every category', () => {
    for (const category of ecosystemCategories) {
      expect(category.authorization.length).toBeGreaterThan(8)
      expect(category.approvalBoundary.length).toBeGreaterThan(8)
      expect(category.firstMilestone.length).toBeGreaterThan(8)
    }
  })

  it('does not count target coverage as connected integrations', () => {
    const email = ecosystemCategories.find((category) => category.id === 'email')!
    const knowledge = ecosystemCategories.find((category) => category.id === 'knowledge')!
    const ai = ecosystemCategories.find((category) => category.id === 'ai-platforms')!
    expect(currentConnectorCount(email, true)).toBe(0)
    expect(currentConnectorCount(knowledge, false)).toBe(1)
    expect(currentConnectorCount(ai, false)).toBe(0)
    expect(currentConnectorCount(ai, true)).toBe(1)
  })

  it('keeps financial, medical, industrial, and physical-control domains high risk', () => {
    for (const id of ['finance', 'health-wearables', 'bio-medical', 'industrial', 'robotics']) {
      expect(ecosystemCategories.find((category) => category.id === id)?.risk).toBe('critical')
    }
  })
})
