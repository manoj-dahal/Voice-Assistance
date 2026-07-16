import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import {
  allowedDesktopChannels,
  isAllowedDesktopChannel,
  sanitizeDesktopApp
} from '../src/main/lib/system.ts'

const electronMain = await readFile(new URL('../src/main/electron.mjs', import.meta.url), 'utf8')
const preload = await readFile(new URL('../src/preload/index.cjs', import.meta.url), 'utf8')

const requiredChannels = [
  'agent-status',
  'get-all-apps',
  'open-app',
  'close-app',
  'capture-screen',
  'clipboard-read',
  'clipboard-write',
  'window-minimize',
  'window-toggle-maximize',
  'window-close'
]

describe('desktop automation contract', () => {
  it('allowlists every tested desktop capability in main and preload', () => {
    for (const channel of requiredChannels) {
      expect(allowedDesktopChannels).toContain(channel)
      expect(isAllowedDesktopChannel(channel)).toBe(true)
      expect(preload).toContain(`'${channel}'`)
      expect(electronMain).toContain(`'${channel}'`)
    }
    expect(isAllowedDesktopChannel('run-arbitrary-command')).toBe(false)
  })

  it('sanitizes desktop application records', () => {
    expect(sanitizeDesktopApp({ id: 'notepad', name: 'Notepad' }))
      .toEqual({ id: 'notepad', name: 'Notepad' })
    expect(sanitizeDesktopApp({ id: '', name: 'Bad' })).toBeNull()
    expect(sanitizeDesktopApp(null)).toBeNull()
  })

  it('contains the release-gating self-test checks', () => {
    for (const check of [
      'pythonAbsent',
      'rendererLoaded',
      'browserCommand',
      'agentStatusTransition',
      'clipboard',
      'screenshot',
      'applicationLaunch',
      'applicationClose'
    ]) {
      expect(electronMain).toContain(check)
    }
  })
})
