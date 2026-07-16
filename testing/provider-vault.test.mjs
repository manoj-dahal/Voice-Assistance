import { describe, expect, it } from 'vitest'
import {
  providerIsConfigured,
  publicProviderSettings,
  sanitizeProviderUpdate
} from '../src/main/lib/provider-vault.mjs'

describe('provider vault validation', () => {
  it('accepts provider routing plus HTTPS and localhost custom AI base URLs', () => {
    expect(sanitizeProviderUpdate({ activeProvider: 'gemini', fallbackProvider: 'groq' }))
      .toMatchObject({ activeProvider: 'gemini', fallbackProvider: 'groq' })
    expect(sanitizeProviderUpdate({ customBaseUrl: 'https://ai.example.com/v1/' }).customBaseUrl)
      .toBe('https://ai.example.com/v1')
    expect(sanitizeProviderUpdate({ customBaseUrl: 'http://localhost:11434/v1' }).customBaseUrl)
      .toBe('http://localhost:11434/v1')
  })

  it('rejects insecure remote custom AI URLs and URL credentials', () => {
    expect(() => sanitizeProviderUpdate({ customBaseUrl: 'http://ai.example.com/v1' }))
      .toThrow(/HTTPS/)
    expect(() => sanitizeProviderUpdate({ customBaseUrl: 'https://user:pass@ai.example.com/v1' }))
      .toThrow(/credentials/)
  })

  it('never exposes saved API key values in public settings', () => {
    const settings = publicProviderSettings({
      activeProvider: 'gemini',
      geminiKey: 'secret-gemini',
      groqKey: 'secret-groq',
      huggingFaceKey: '',
      tavilyKey: '',
      customApiKey: 'secret-custom',
      geminiModel: 'gemini-test',
      groqModel: 'groq-test',
      customBaseUrl: 'https://example.com/v1',
      customModel: 'custom-test'
    })
    expect(JSON.stringify(settings)).not.toContain('secret-')
    expect(settings.keyStatus.gemini).toBe('saved')
    expect(settings.keyStatus.huggingFace).toBe('missing')
  })

  it('supports keyless localhost models but requires keys for remote providers', () => {
    expect(providerIsConfigured({
      activeProvider: 'custom', customBaseUrl: 'http://localhost:11434/v1', customModel: 'qwen', customApiKey: ''
    })).toBe(true)
    expect(providerIsConfigured({
      activeProvider: 'custom', customBaseUrl: 'https://example.com/v1', customModel: 'qwen', customApiKey: ''
    })).toBe(false)
    expect(providerIsConfigured({
      activeProvider: 'groq', groqKey: 'gsk_test', groqModel: 'model'
    })).toBe(true)
  })
})
