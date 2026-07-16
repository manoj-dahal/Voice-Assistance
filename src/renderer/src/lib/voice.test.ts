import { describe, expect, it } from 'vitest'
import { selectEraVoice } from './voice'

function voice(name: string, lang: string, localService = true) {
  return {
    default: false,
    lang,
    localService,
    name,
    voiceURI: name
  } as SpeechSynthesisVoice
}

describe('selectEraVoice', () => {
  const voices = [
    voice('Desktop David', 'en-US'),
    voice('Microsoft Aria', 'en-US'),
    voice('Kyoko', 'ja-JP')
  ]

  it('prefers a soft feminine voice matching the selected language', () => {
    const selected = selectEraVoice(voices, {
      language: 'en-US',
      selectedVoice: '',
      voiceStyle: 'anime-soft'
    })
    expect(selected?.name).toBe('Microsoft Aria')
  })

  it('respects an explicit voice selection', () => {
    const selected = selectEraVoice(voices, {
      language: 'en-US',
      selectedVoice: 'Desktop David',
      voiceStyle: 'anime-soft'
    })
    expect(selected?.name).toBe('Desktop David')
  })
})
