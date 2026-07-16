import type { EraSettings } from './storage'

const softFeminineVoiceHints = [
  'ana',
  'aria',
  'jenny',
  'nanami',
  'mei',
  'haruka',
  'samantha',
  'zira',
  'victoria',
  'karen',
  'tessa',
  'moira',
  'female'
]

function languageScore(voice: SpeechSynthesisVoice, language: string) {
  const voiceLanguage = voice.lang.toLowerCase()
  const desired = language.toLowerCase()
  if (voiceLanguage === desired) return 30
  if (voiceLanguage.split('-')[0] === desired.split('-')[0]) return 16
  return 0
}

export function selectEraVoice(
  voices: SpeechSynthesisVoice[],
  settings: Pick<EraSettings, 'language' | 'selectedVoice' | 'voiceStyle'>
) {
  const explicitlySelected = voices.find((voice) => voice.voiceURI === settings.selectedVoice)
  if (explicitlySelected) return explicitlySelected

  const ranked = voices
    .map((voice) => {
      const name = voice.name.toLowerCase()
      const personalityScore = settings.voiceStyle === 'anime-soft'
        ? softFeminineVoiceHints.reduce(
            (score, hint, index) => score + (name.includes(hint) ? 24 - index : 0),
            0
          )
        : 0
      return {
        voice,
        score: languageScore(voice, settings.language) + personalityScore + (voice.localService ? 2 : 0)
      }
    })
    .sort((left, right) => right.score - left.score)

  return ranked[0]?.voice
}

export function createEraUtterance(
  text: string,
  settings: Pick<EraSettings, 'language' | 'selectedVoice' | 'voiceStyle'>,
  voices: SpeechSynthesisVoice[]
) {
  const spokenText = text
    .replace(/[*_#`]/g, '')
    .replace(/https?:\/\/\S+/g, 'the linked source')
  const utterance = new SpeechSynthesisUtterance(spokenText)
  const voice = selectEraVoice(voices, settings)

  utterance.lang = voice?.lang || settings.language
  if (voice) utterance.voice = voice

  if (settings.voiceStyle === 'anime-soft') {
    utterance.rate = 0.9
    utterance.pitch = 1.34
    utterance.volume = 0.92
  } else {
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
  }

  return utterance
}
