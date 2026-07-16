import { useEffect, useRef } from 'react'
import type { VoiceState } from './VoiceOrb'

interface ParticleVoiceCoreProps {
  state: VoiceState
  supported: boolean
  onToggle: () => void
}

interface Point3D {
  x: number
  y: number
  z: number
  size: number
  phase: number
}

const stateLabels: Record<VoiceState, string> = {
  idle: 'VOICE CORE STANDBY',
  listening: 'LISTENING…',
  thinking: 'PROCESSING…',
  speaking: 'ERA IS SPEAKING…'
}

function createSpherePoints(count: number) {
  const points: Point3D[] = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / (count - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    const angle = goldenAngle * index
    points.push({
      x: Math.cos(angle) * radius,
      y,
      z: Math.sin(angle) * radius,
      size: 0.45 + ((index * 37) % 100) / 125,
      phase: ((index * 83) % 360) * (Math.PI / 180)
    })
  }
  return points
}

export function ParticleVoiceCore({ state, supported, onToggle }: ParticleVoiceCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const points = createSpherePoints(1_350)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let animationId = 0
    let width = 420
    let height = 420

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(bounds.width, 1)
      height = Math.max(bounds.height, 1)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const draw = () => {
      context.clearRect(0, 0, width, height)
      const centerX = width / 2
      const centerY = height / 2
      const sphereRadius = Math.min(width, height) * 0.255
      const time = reducedMotion ? 0 : frame * 0.0045
      const rotationY = time * (state === 'thinking' ? 2.1 : state === 'listening' ? 1.35 : 0.72)
      const rotationX = -0.18 + Math.sin(time * 0.45) * 0.07
      const pulse = state === 'listening' ? 1 + Math.sin(frame * 0.09) * 0.045 : 1
      const color = state === 'idle'
        ? [27, 34, 39]
        : state === 'listening'
          ? [0, 151, 220]
          : state === 'thinking'
            ? [104, 79, 181]
            : [0, 166, 143]

      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, sphereRadius * 1.12)
      glow.addColorStop(0, `rgba(${color.join(',')},0.12)`)
      glow.addColorStop(0.58, `rgba(${color.join(',')},0.035)`)
      glow.addColorStop(1, 'rgba(255,255,255,0)')
      context.fillStyle = glow
      context.beginPath()
      context.arc(centerX, centerY, sphereRadius * 1.2, 0, Math.PI * 2)
      context.fill()

      const projected = points.map((point) => {
        const cosY = Math.cos(rotationY + point.phase * 0.018)
        const sinY = Math.sin(rotationY + point.phase * 0.018)
        const x1 = point.x * cosY - point.z * sinY
        const z1 = point.x * sinY + point.z * cosY
        const cosX = Math.cos(rotationX)
        const sinX = Math.sin(rotationX)
        const y2 = point.y * cosX - z1 * sinX
        const z2 = point.y * sinX + z1 * cosX
        const depth = (z2 + 1) / 2
        const perspective = 0.76 + depth * 0.35
        const noise = 1 + Math.sin(frame * 0.025 + point.phase) * 0.018
        return {
          x: centerX + x1 * sphereRadius * perspective * pulse * noise,
          y: centerY + y2 * sphereRadius * perspective * pulse * noise,
          z: z2,
          depth,
          size: point.size * (0.55 + depth * 1.15)
        }
      }).sort((left, right) => left.z - right.z)

      for (const point of projected) {
        const alpha = 0.18 + point.depth * 0.68
        context.fillStyle = `rgba(${color.join(',')},${alpha})`
        context.beginPath()
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        context.fill()
      }

      context.strokeStyle = `rgba(${color.join(',')},${state === 'idle' ? 0.1 : 0.22})`
      context.lineWidth = 0.7
      context.beginPath()
      context.ellipse(centerX, centerY, sphereRadius * 1.12 * pulse, sphereRadius * 0.34, 0, 0, Math.PI * 2)
      context.stroke()

      frame += 1
      animationId = window.requestAnimationFrame(draw)
    }

    draw()
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(animationId)
    }
  }, [state])

  return (
    <div className="particle-voice-core" data-state={state}>
      <button type="button" onClick={onToggle} disabled={!supported && state !== 'speaking'} aria-label="Toggle ERA voice input">
        <canvas ref={canvasRef} />
        <span className="particle-focus-dot" />
      </button>
      <span className="particle-state-label">{stateLabels[state]}</span>
    </div>
  )
}
