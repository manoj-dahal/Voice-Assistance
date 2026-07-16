import { ArrowUp, Keyboard, Mic, MicOff, Paperclip } from 'lucide-react'
import { FormEvent, KeyboardEvent, useRef } from 'react'

interface ComposerProps {
  value: string
  isBusy: boolean
  isListening: boolean
  voiceSupported: boolean
  attachmentCount?: number
  onChange: (value: string) => void
  onSubmit: () => void
  onVoiceToggle: () => void
  onFiles?: (files: FileList) => void
}

export function Composer({
  value,
  isBusy,
  isListening,
  voiceSupported,
  attachmentCount = 0,
  onChange,
  onSubmit,
  onVoiceToggle,
  onFiles
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <button
        className="composer-icon quiet"
        type="button"
        aria-label="Focus keyboard input"
        onClick={() => textareaRef.current?.focus()}
      >
        <Keyboard size={18} />
      </button>
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? 'Listening…' : 'Ask ERA anything…'}
        aria-label="Message ERA"
      />
      {onFiles && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(event) => {
              if (event.target.files?.length) onFiles(event.target.files)
              event.target.value = ''
            }}
          />
          <button
            className={attachmentCount ? 'composer-icon attachment active' : 'composer-icon attachment'}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach files"
            title="Attach files without executing them"
          >
            <Paperclip size={17} />
            {attachmentCount > 0 && <span className="attachment-count">{attachmentCount}</span>}
          </button>
        </>
      )}
      <button
        className={isListening ? 'composer-icon voice active' : 'composer-icon voice'}
        type="button"
        onClick={onVoiceToggle}
        disabled={!voiceSupported}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        title={voiceSupported ? 'Use voice' : 'Voice input needs Chrome or Edge'}
      >
        {voiceSupported ? <Mic size={18} /> : <MicOff size={18} />}
      </button>
      <button
        className="send-button"
        type="submit"
        disabled={(!value.trim() && attachmentCount === 0) || isBusy}
        aria-label="Send message"
      >
        <ArrowUp size={18} />
      </button>
    </form>
  )
}
