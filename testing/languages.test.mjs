import { describe, expect, it } from 'vitest'
import { iso6393 } from 'iso-639-3'

describe('language catalog', () => {
  it('contains the complete ISO 639-3 registry', () => {
    expect(iso6393.length).toBeGreaterThan(7_800)
    expect(new Set(iso6393.map((language) => language.iso6393)).size).toBe(iso6393.length)
  })

  it('includes major languages and individual-language entries', () => {
    for (const id of ['eng', 'npi', 'hin', 'spa', 'arb', 'cmn', 'yue', 'tam', 'swa']) {
      expect(iso6393.some((language) => language.iso6393 === id)).toBe(true)
    }
  })
})
