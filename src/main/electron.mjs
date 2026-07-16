import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import {
  capturePrimaryScreen,
  closeLaunchedApplication,
  getInstalledApplications,
  launchApplication,
  openApprovedExternalUrl,
  readClipboardText,
  verifyPythonAbsent,
  writeClipboardText
} from './lib/desktop-automation.mjs'

const moduleDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(moduleDirectory, '../..')
const serverPort = Number(process.env.PORT || 8787)
const serverOrigin = `http://127.0.0.1:${serverPort}`

const hasSingleInstanceLock = app.requestSingleInstanceLock()
if (!hasSingleInstanceLock) app.quit()

function registerDesktopBridge() {
  ipcMain.handle('agent-status', async () => ({ online: true, platform: process.platform }))
  ipcMain.handle('get-all-apps', getInstalledApplications)
  ipcMain.handle('open-app', (_event, name) => launchApplication(name))
  ipcMain.handle('close-app', (_event, pid) => closeLaunchedApplication(pid))
  ipcMain.handle('capture-screen', capturePrimaryScreen)
  ipcMain.handle('clipboard-read', async () => ({ text: readClipboardText() }))
  ipcMain.handle('clipboard-write', (_event, text) => writeClipboardText(text))
  ipcMain.handle('open-external-url', (_event, url) => openApprovedExternalUrl(url))
  ipcMain.handle('window-minimize', (event) => BrowserWindow.fromWebContents(event.sender)?.minimize())
  ipcMain.handle('window-toggle-maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return false
    if (window.isMaximized()) window.unmaximize()
    else window.maximize()
    return window.isMaximized()
  })
  ipcMain.handle('window-close', (event) => BrowserWindow.fromWebContents(event.sender)?.close())
  ipcMain.handle('secure-get-keys', async () => ({
    delegatedTo: '/api/settings/providers'
  }))
  ipcMain.handle('secure-save-keys', async () => ({
    saved: false,
    reason: 'Provider secrets must be saved through the encrypted local provider API.'
  }))
}

async function waitForServer(timeoutMs = 15_000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${serverOrigin}/api/health`)
      if (response.ok) return
    } catch {
      // The local server is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 150))
  }
  throw new Error('ERA local server did not become ready in time')
}

async function createWindow({ show = true } = {}) {
  const window = new BrowserWindow({
    width: 1376,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    show: false,
    backgroundColor: '#ffffff',
    title: 'ERA AI',
    icon: join(projectRoot, 'resources/build/icon.png'),
    webPreferences: {
      preload: join(moduleDirectory, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  })

  if (show) window.once('ready-to-show', () => window.show())
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(serverOrigin)) event.preventDefault()
  })
  await window.loadURL(serverOrigin)
  return window
}

async function runDesktopSelfTest(window) {
  const checks = {}

  const health = await fetch(`${serverOrigin}/api/health`).then((response) => response.json())
  checks.localApi = { passed: health.status === 'ok', detail: health }

  const python = verifyPythonAbsent()
  checks.pythonAbsent = {
    passed: process.env.ERA_EXPECT_NO_PYTHON === '1' ? python.absent === true : true,
    detail: python
  }

  const ui = await window.webContents.executeJavaScript(`({
    dashboard: document.body.innerText.includes('Dashboard'),
    macros: document.body.innerText.includes('Macros'),
    apps: document.body.innerText.includes('Apps'),
    transcript: document.body.innerText.includes('Transcript'),
    agentStatus: document.querySelector('[data-testid="agent-status"]')?.innerText || '',
    statusHistory: document.querySelector('[data-testid="agent-status"]')?.dataset.history || ''
  })`)
  checks.rendererLoaded = {
    passed: Boolean(ui.dashboard && ui.macros && ui.apps && ui.transcript),
    detail: ui
  }
  checks.agentStatusTransition = {
    passed: ui.agentStatus.includes('Agent Online') && ui.statusHistory.includes('offline,online'),
    detail: { status: ui.agentStatus, history: ui.statusHistory }
  }

  const browserCommand = await window.webContents.executeJavaScript(`(async () => {
    const textarea = document.querySelector('[aria-label="Message ERA"]')
    if (!textarea) return { passed: false, reason: 'Composer not found' }
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
    setter.call(textarea, 'Calculate 2 + 2')
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 100))
    const send = document.querySelector('[aria-label="Send message"]')
    if (!send || send.disabled) return { passed: false, reason: 'Send button unavailable' }
    send.click()
    await new Promise((resolve) => setTimeout(resolve, 1200))
    return { passed: document.body.innerText.includes('The answer is 4.'), reason: 'Local calculation command' }
  })()`)
  checks.browserCommand = browserCommand

  const originalClipboard = readClipboardText()
  const marker = `ERA_CLIPBOARD_TEST_${Date.now()}`
  writeClipboardText(marker)
  checks.clipboard = {
    passed: readClipboardText() === marker,
    detail: 'Clipboard round trip'
  }
  writeClipboardText(originalClipboard)

  const screenshot = await capturePrimaryScreen()
  checks.screenshot = {
    passed: screenshot.bytes > 1_000 && screenshot.width > 0 && screenshot.height > 0,
    detail: { name: screenshot.name, width: screenshot.width, height: screenshot.height, bytes: screenshot.bytes }
  }

  const applications = await getInstalledApplications()
  checks.applicationDiscovery = {
    passed: process.platform !== 'win32' || applications.some((item) => item.id === 'notepad'),
    detail: applications
  }

  if (process.platform === 'win32') {
    const launched = await launchApplication('Notepad')
    checks.applicationLaunch = { passed: launched.opened === true, detail: launched }
    if (launched.pid) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      checks.applicationClose = await closeLaunchedApplication(launched.pid)
      checks.applicationClose.passed = checks.applicationClose.closed === true
    } else {
      checks.applicationClose = { passed: false, reason: 'No launched process id' }
    }
  } else {
    checks.applicationLaunch = { passed: true, skipped: 'Windows-specific release check' }
    checks.applicationClose = { passed: true, skipped: 'Windows-specific release check' }
  }

  const passed = Object.values(checks).every((check) => check.passed === true)
  const report = {
    passed,
    platform: process.platform,
    architecture: process.arch,
    packaged: app.isPackaged,
    createdAt: new Date().toISOString(),
    checks
  }
  const reportPath = process.env.ERA_SELF_TEST_REPORT || join(app.getPath('userData'), 'desktop-self-test.json')
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8')
  console.log(`ERA_DESKTOP_SELF_TEST_REPORT=${reportPath}`)
  console.log(JSON.stringify(report, null, 2))
  return report
}

if (hasSingleInstanceLock) app.whenReady().then(async () => {
  const userData = app.getPath('userData')
  process.env.PORT = String(serverPort)
  process.env.ERA_DATA_DIR ||= join(userData, '.era')
  process.env.NOTES_DIR ||= join(userData, 'notes')
  await mkdir(process.env.ERA_DATA_DIR, { recursive: true, mode: 0o700 })
  await mkdir(process.env.NOTES_DIR, { recursive: true, mode: 0o700 })

  registerDesktopBridge()

  const trustedSession = (await import('electron')).session.defaultSession
  trustedSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const trusted = webContents.getURL().startsWith(serverOrigin)
    callback(Boolean(trusted && (permission === 'media' || permission === 'notifications')))
  })

  await import('./index.mjs')
  await waitForServer()
  const selfTest = process.argv.includes('--self-test') || process.env.ERA_DESKTOP_SELF_TEST === '1'
  const mainWindow = await createWindow({ show: !selfTest })

  if (selfTest) {
    const report = await runDesktopSelfTest(mainWindow)
    app.exit(report.passed ? 0 : 1)
    return
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow()
  })
}).catch((error) => {
  console.error('ERA desktop startup failed:', error)
  app.quit()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
