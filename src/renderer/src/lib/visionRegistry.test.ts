import { describe, expect, it } from 'vitest'
import { upgradeClaims, visionSystems } from './visionRegistry'

describe('vision registry', () => {
  it('contains the full large-form roadmap without duplicate ids', () => {
    expect(visionSystems.length).toBe(152)
    expect(new Set(visionSystems.map((system) => system.id)).size).toBe(visionSystems.length)
  })

  it('never labels an aspirational system complete', () => {
    expect(visionSystems.every((system) => ['planned', 'research', 'speculative'].includes(system.status))).toBe(true)
  })

  it('keeps consciousness and quantum systems speculative', () => {
    const frontier = visionSystems.filter((system) => /consciousness|quantum|neural bridge/i.test(system.name))
    expect(frontier.length).toBeGreaterThan(0)
    expect(frontier.every((system) => system.status === 'speculative')).toBe(true)
  })

  it('records upgrade claims behind evidence gates rather than verification badges', () => {
    expect(upgradeClaims).toHaveLength(10)
    expect(upgradeClaims.every((claim) =>
      ['benchmark-required', 'research', 'speculative', 'undefined'].includes(claim.disposition)
    )).toBe(true)
    expect(upgradeClaims.find((claim) => claim.id === 'reasoning-v7-quantum')?.disposition).toBe('speculative')
    expect(upgradeClaims.find((claim) => claim.id === 'other-82-unspecified')?.disposition).toBe('undefined')
  })
})
