import { Mic, Square } from 'lucide-react'

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface VoiceOrbProps {
  state: VoiceState
  supported: boolean
  onToggle: () => void
}

const stateCopy: Record<VoiceState, { label: string; hint: string }> = {
  idle: { label: 'Ready when you are', hint: 'Tap the core or say “Hey, ERA”' },
  listening: { label: 'I’m listening', hint: 'Speak naturally' },
  thinking: { label: 'Thinking', hint: 'Finding the clearest answer' },
  speaking: { label: 'Speaking', hint: 'Tap to interrupt' }
}

export function VoiceOrb({ state, supported, onToggle }: VoiceOrbProps) {
  const copy = stateCopy[state]
  const isActive = state === 'listening' || state === 'speaking'

  return (
    <div className="voice-stage" data-state={state}>
      <div className="orb-status" aria-live="polite">
        <span className="status-pulse" />
        {copy.label}
      </div>

      <div className="orb-wrap">
        <div className="ambient-halo halo-one" />
        <div className="ambient-halo halo-two" />
        <div className="orbit orbit-outer">
          <span />
        </div>
        <div className="orbit orbit-mid">
          <span />
        </div>
        <div className="orbit orbit-inner" />
        <button
          className="orb-core"
          type="button"
          onClick={onToggle}
          disabled={!supported && state !== 'speaking'}
          aria-label={isActive ? 'Stop voice interaction' : 'Start listening'}
        >
          <img className="orb-brand-image" src="/brand/era-vision-core.webp" alt="" />
          <span className="orb-sheen" />
          <span className={isActive ? 'orb-icon active' : 'orb-icon'}>
            {isActive ? <Square size={14} fill="currentColor" /> : <Mic size={15} />}
          </span>
        </button>
        <div className="waveform" aria-hidden="true">
          {Array.from({ length: 17 }, (_, index) => (
            <span key={index} style={{ '--bar': index } as React.CSSProperties} />
          ))}
        </div>
      </div>

      <p className="orb-hint">{supported ? copy.hint : 'Voice input needs Chrome or Edge'}</p>
    </div>
  )
}
