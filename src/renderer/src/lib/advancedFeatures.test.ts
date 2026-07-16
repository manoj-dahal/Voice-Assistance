import { describe, expect, it } from 'vitest'
import { advancedFeatures } from './advancedFeatures'

describe('advanced feature roadmap', () => {
  it('registers all 62 suggested additions with unique ids', () => {
    expect(advancedFeatures).toHaveLength(62)
    expect(new Set(advancedFeatures.map((feature) => feature.id)).size).toBe(62)
  })

  it('keeps every addition non-operational until implementation evidence exists', () => {
    expect(advancedFeatures.every((feature) =>
      feature.status === 'planned' || feature.status === 'research'
    )).toBe(true)
  })

  it('marks identity, physical, and marketplace research as higher risk', () => {
    for (const name of ['Speaker Separation', 'Signed Skill Marketplace']) {
      expect(advancedFeatures.find((feature) => feature.name === name)?.risk).toBe('high')
    }
  })
})
