import { clipboard, desktopCapturer, shell } from 'electron'
import { spawn, spawnSync } from 'node:child_process'
import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { join } from 'node:path'

const launchedProcesses = new Map()

const platformApps = {
  win32: [
    { id: 'notepad', name: 'Notepad', command: 'notepad.exe', args: [] },
    { id: 'calculator', name: 'Calculator', command: 'calc.exe', args: [] },
    { id: 'paint', name: 'Paint', command: 'mspaint.exe', args: [] },
    { id: 'explorer', name: 'File Explorer', command: 'explorer.exe', args: [] }
  ],
  darwin: [
    { id: 'textedit', name: 'TextEdit', command: 'open', args: ['-a', 'TextEdit'] },
    { id: 'calculator', name: 'Calculator', command: 'open', args: ['-a', 'Calculator'] },
    { id: 'finder', name: 'Finder', command: 'open', args: ['-a', 'Finder'] }
  ],
  linux: [
    { id: 'text-editor', name: 'Text Editor', command: 'xdg-open', args: ['.'] },
    { id: 'files', name: 'Files', command: 'xdg-open', args: ['.'] }
  ]
}

function availableApps() {
  return platformApps[process.platform] || []
}

export async function getInstalledApplications() {
  return availableApps().map(({ id, name }) => ({ id, name }))
}

export async function launchApplication(requestedName) {
  const normalized = String(requestedName || '').trim().toLocaleLowerCase()
  const app = availableApps().find((candidate) =>
    candidate.name.toLocaleLowerCase() === normalized || candidate.id === normalized)
  if (!app) return { opened: false, reason: 'Application is not on the approved desktop allowlist.' }

  const child = spawn(app.command, app.args, {
    detached: false,
    stdio: 'ignore',
    windowsHide: false,
    shell: false
  })
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, 500)
    child.once('spawn', () => {
      clearTimeout(timeout)
      resolve()
    })
    child.once('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
  })
  launchedProcesses.set(child.pid, child)
  child.once('exit', () => launchedProcesses.delete(child.pid))
  return { opened: true, app: app.name, pid: child.pid }
}

export async function closeLaunchedApplication(pid) {
  const numericPid = Number(pid)
  const child = launchedProcesses.get(numericPid)
  if (!child) return { closed: false, reason: 'ERA did not launch this process.' }
  const closed = child.kill()
  if (closed) launchedProcesses.delete(numericPid)
  return { closed }
}

export async function capturePrimaryScreen() {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 1280, height: 720 },
    fetchWindowIcons: false
  })
  const source = sources[0]
  if (!source || source.thumbnail.isEmpty()) throw new Error('No desktop screen source is available')
  const png = source.thumbnail.toPNG()
  return {
    name: source.name,
    width: source.thumbnail.getSize().width,
    height: source.thumbnail.getSize().height,
    bytes: png.length,
    dataUrl: `data:image/png;base64,${png.toString('base64')}`
  }
}

export function readClipboardText() {
  return clipboard.readText()
}

export function writeClipboardText(text) {
  const value = String(text ?? '').slice(0, 1_000_000)
  clipboard.writeText(value)
  return { written: true, characters: value.length }
}

export async function openApprovedExternalUrl(value) {
  const url = new URL(String(value))
  if (url.protocol !== 'https:') throw new Error('Only HTTPS external URLs are allowed')
  await shell.openExternal(url.toString())
  return { opened: true }
}

export function verifyPythonAbsent() {
  if (process.platform !== 'win32') {
    return { checked: false, absent: null, reason: 'Python absence check is Windows-specific.' }
  }
  const python = spawnSync('where.exe', ['python'], { encoding: 'utf8', windowsHide: true })
  const py = spawnSync('where.exe', ['py'], { encoding: 'utf8', windowsHide: true })
  return {
    checked: true,
    absent: python.status !== 0 && py.status !== 0,
    pythonPath: python.status === 0 ? python.stdout.trim() : '',
    pyPath: py.status === 0 ? py.stdout.trim() : ''
  }
}

export async function pathExists(path) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

export function expectedWindowsExecutable(releaseDirectory) {
  return join(releaseDirectory, 'win-unpacked', 'era-ai.exe')
}
