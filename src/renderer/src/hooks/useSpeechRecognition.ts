import { useCallback, useEffect, useRef, useState } from 'react'

interface SpeechRecognitionOptions {
  language: string
  onFinalTranscript: (transcript: string) => void
}

const errorMessages: Record<string, string> = {
  'audio-capture': 'No microphone was found.',
  network: 'Voice recognition needs a network connection.',
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings.',
  'service-not-allowed': 'Voice recognition is not available in this browser.',
  'no-speech': 'I didn’t hear anything. Try once more.'
}

export function useSpeechRecognition({
  language,
  onFinalTranscript
}: SpeechRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalCallbackRef = useRef(onFinalTranscript)
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const Recognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined
  const isSupported = Boolean(Recognition)

  useEffect(() => {
    finalCallbackRef.current = onFinalTranscript
  }, [onFinalTranscript])

  useEffect(() => {
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language

    recognition.onstart = () => {
      setError(null)
      setInterimTranscript('')
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || ''
        if (event.results[index].isFinal) final += transcript
        else interim += transcript
      }

      setInterimTranscript(interim)
      if (final.trim()) {
        setInterimTranscript('')
        finalCallbackRef.current(final.trim())
      }
    }

    recognition.onerror = (event) => {
      setError(errorMessages[event.error] || 'Voice recognition stopped unexpectedly.')
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition
    return () => {
      recognition.abort()
      recognitionRef.current = null
    }
  }, [Recognition, language])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return
    setError(null)
    try {
      recognitionRef.current.start()
    } catch {
      setError('The microphone is already in use. Try again in a moment.')
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return {
    error,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    clearError: () => setError(null)
  }
}
