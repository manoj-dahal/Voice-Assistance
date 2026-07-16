import { describe, expect, it } from 'vitest'
import { readFile, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

const config = await readFile(new URL('../electron-builder.yml', import.meta.url), 'utf8')
const entitlements = await readFile(new URL('../resources/build/entitlements.mac.plist', import.meta.url), 'utf8')

function pngDimensions(data) {
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20)
  }
}

describe('Electron packaging configuration', () => {
  it('uses the secure desktop entrypoint and stable application identity', () => {
    expect(packageJson.main).toBe('src/main/electron.mjs')
    expect(config).toContain('appId: com.era.aera.manoj')
    expect(config).toContain('productName: ERA AI')
    expect(config).toContain('asar: true')
    expect(config).toContain('compression: maximum')
  })

  it('defines Windows, macOS, and Linux targets', () => {
    expect(config).toContain('target: nsis')
    expect(config).toContain('- dmg')
    expect(config).toContain('- AppImage')
    expect(config).toContain('- snap')
    expect(config).toContain('- deb')
  })

  it('provides a sufficiently large platform icon', async () => {
    const path = new URL('../resources/build/icon.png', import.meta.url)
    expect((await stat(path)).size).toBeGreaterThan(10_000)
    const dimensions = pngDimensions(await readFile(path))
    expect(dimensions).toEqual({ width: 512, height: 512 })
  })

  it('declares macOS camera, microphone, network, and selected-file entitlements', () => {
    expect(entitlements).toContain('com.apple.security.device.audio-input')
    expect(entitlements).toContain('com.apple.security.device.camera')
    expect(entitlements).toContain('com.apple.security.network.client')
    expect(entitlements).toContain('com.apple.security.files.user-selected.read-write')
  })
})
