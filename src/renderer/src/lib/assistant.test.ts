import { describe, expect, it } from 'vitest'
import { runLocalCommand } from './assistant'

const now = new Date('2026-07-14T09:05:00')

describe('runLocalCommand', () => {
  it('greets the user based on the time of day', () => {
    expect(runLocalCommand('Hey ERA', now).response).toContain('Good morning')
  })

  it('creates a dependency-aware agent mission from voice or text', () => {
    expect(runLocalCommand('Start a multi-agent mission for reviewing the ERA roadmap', now).action).toEqual({
      type: 'create-agent-mission',
      objective: 'reviewing the ERA roadmap'
    })
  })

  it('activates the emergency privacy lock locally', () => {
    expect(runLocalCommand('Activate privacy lock', now).action).toEqual({ type: 'privacy-lock' })
  })

  it('creates explicit memories', () => {
    const result = runLocalCommand('Remember that I prefer dark mode', now)
    expect(result.handled).toBe(true)
    expect(result.action).toEqual({ type: 'remember', content: 'I prefer dark mode' })
  })

  it('creates durable relative and recurring reminders', () => {
    expect(runLocalCommand('Remind me in 10 minutes to review the roadmap', now).action).toEqual({
      type: 'create-reminder',
      content: 'review the roadmap',
      dueAt: new Date(now.getTime() + 10 * 60_000).toISOString(),
      recurrence: 'none'
    })
    expect(runLocalCommand('Remind me every week to back up ERA', now).action).toEqual({
      type: 'create-reminder',
      content: 'back up ERA',
      dueAt: new Date(now.getTime() + 7 * 86_400_000).toISOString(),
      recurrence: 'weekly'
    })
  })

  it('starts minute and second timers', () => {
    expect(runLocalCommand('Start a 25 minute timer', now).action).toEqual({
      type: 'start-timer',
      seconds: 1500,
      label: '25 minutes'
    })
    expect(runLocalCommand('Set a 10 second timer', now).action).toEqual({
      type: 'start-timer',
      seconds: 10,
      label: '10 seconds'
    })
  })

  it('only opens destinations on the allowlist', () => {
    expect(runLocalCommand('Open GitHub', now).action).toEqual({
      type: 'open-url',
      url: 'https://github.com',
      label: 'GitHub'
    })
    expect(runLocalCommand('Open definitely-not-a-real-app', now).handled).toBe(false)
  })

  it('builds encoded search URLs', () => {
    expect(runLocalCommand('Search the web for voice first AI', now).action).toEqual({
      type: 'open-url',
      url: 'https://www.google.com/search?q=voice%20first%20AI',
      label: 'search results for voice first AI'
    })
  })

  it('evaluates arithmetic without eval', () => {
    expect(runLocalCommand('Calculate (12 + 8) / 4', now).response).toBe('The answer is 5.')
    expect(runLocalCommand('What is 10 / 0', now).response).toContain('couldn’t calculate')
  })

  it('passes open-ended requests to the configured provider', () => {
    expect(runLocalCommand('Explain how neural networks learn', now)).toEqual({ handled: false })
  })
})
