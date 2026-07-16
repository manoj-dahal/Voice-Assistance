import { describe, expect, it } from 'vitest'
import { capabilities, resolveCapabilityStatus } from './capabilities'

describe('capability registry', () => {
  it('documents reality, permissions, and a next step for every capability', () => {
    for (const capability of capabilities) {
      expect(capability.reality.length).toBeGreaterThan(20)
      expect(capability.permission.length).toBeGreaterThan(5)
      expect(capability.nextStep.length).toBeGreaterThan(5)
    }
  })

  it('marks consciousness, quantum, and neural bridge claims as speculative', () => {
    for (const id of ['consciousness', 'quantum-signal', 'neural-bridge']) {
      expect(capabilities.find((capability) => capability.id === id)?.status).toBe('speculative')
    }
  })

  it('downgrades cloud-dependent capabilities when no provider is connected', () => {
    const vision = capabilities.find((capability) => capability.id === 'vision')!
    expect(resolveCapabilityStatus(vision, false)).toBe('adapter-ready')
    expect(resolveCapabilityStatus(vision, true)).toBe('available')
  })
})
