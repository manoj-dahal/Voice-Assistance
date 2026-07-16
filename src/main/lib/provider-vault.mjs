import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const moduleDirectory = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = resolve(moduleDirectory, '../../..')
const dataDirectory = resolve(projectRoot, process.env.ERA_DATA_DIR || '.era')
const vaultPath = join(dataDirectory, 'providers.vault')
const localKeyPath = join(dataDirectory, 'vault.key')

export const providerDefaults = {
  activeProvider: 'gemini',
  fallbackProvider: 'none',
  geminiKey: '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  groqKey: '',
  groqModel: 'llama-3.3-70b-versatile',
  huggingFaceKey: '',
  tavilyKey: '',
  customBaseUrl: '',
  customApiKey: '',
  customModel: ''
}

const secretFields = [
  'geminiKey',
  'groqKey',
  'huggingFaceKey',
  'tavilyKey',
  'customApiKey'
]

let cachedKey
let cachedVault

async function getEncryptionKey() {
  if (cachedKey) return cachedKey
  if (process.env.ERA_VAULT_SECRET) {
    cachedKey = createHash('sha256').update(process.env.ERA_VAULT_SECRET).digest()
    return cachedKey
  }

  await mkdir(dataDirectory, { recursive: true, mode: 0o700 })
  try {
    const stored = await readFile(localKeyPath)
    if (stored.length !== 32) throw new Error('Local vault key has an invalid length')
    cachedKey = stored
    return cachedKey
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  const generated = randomBytes(32)
  try {
    await writeFile(localKeyPath, generated, { flag: 'wx', mode: 0o600 })
    cachedKey = generated
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    cachedKey = await readFile(localKeyPath)
  }
  return cachedKey
}

function environmentOverrides() {
  return {
    geminiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || '',
    groqKey: process.env.GROQ_API_KEY || '',
    huggingFaceKey: process.env.HUGGINGFACE_API_KEY || '',
    tavilyKey: process.env.TAVILY_API_KEY || ''
  }
}

export async function readProviderVault() {
  if (cachedVault) return { ...cachedVault }
  let decrypted = {}
  try {
    const envelope = JSON.parse(await readFile(vaultPath, 'utf8'))
    const key = await getEncryptionKey()
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(envelope.iv, 'base64')
    )
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'))
    const plain = Buffer.concat([
      decipher.update(Buffer.from(envelope.data, 'base64')),
      decipher.final()
    ])
    decrypted = JSON.parse(plain.toString('utf8'))
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw new Error('Provider vault could not be decrypted. Check ERA_VAULT_SECRET or reset the local vault.')
    }
  }

  const environment = environmentOverrides()
  cachedVault = {
    ...providerDefaults,
    ...decrypted,
    ...Object.fromEntries(Object.entries(environment).filter(([, value]) => value))
  }
  return { ...cachedVault }
}

export async function writeProviderVault(next) {
  const current = await readProviderVault()
  const merged = { ...current, ...next }
  const persisted = { ...merged }
  const environment = environmentOverrides()
  for (const [field, value] of Object.entries(environment)) {
    if (value && secretFields.includes(field)) persisted[field] = ''
  }
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 })
  const key = await getEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(persisted), 'utf8'),
    cipher.final()
  ])
  const envelope = {
    version: 1,
    algorithm: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: encrypted.toString('base64')
  }
  await writeFile(vaultPath, JSON.stringify(envelope), { mode: 0o600 })
  cachedVault = {
    ...persisted,
    ...Object.fromEntries(Object.entries(environment).filter(([, value]) => value))
  }
  return { ...cachedVault }
}

function maskedState(value) {
  return Boolean(value) ? 'saved' : 'missing'
}

export function publicProviderSettings(vault) {
  return {
    activeProvider: vault.activeProvider,
    fallbackProvider: vault.fallbackProvider || 'none',
    geminiModel: vault.geminiModel,
    groqModel: vault.groqModel,
    customBaseUrl: vault.customBaseUrl,
    customModel: vault.customModel,
    keyStatus: {
      gemini: maskedState(vault.geminiKey),
      groq: maskedState(vault.groqKey),
      huggingFace: maskedState(vault.huggingFaceKey),
      tavily: maskedState(vault.tavilyKey),
      custom: maskedState(vault.customApiKey)
    },
    vaultProtection: process.env.ERA_VAULT_SECRET ? 'environment-secret' : 'local-key-file'
  }
}

export function sanitizeProviderUpdate(body) {
  const providers = new Set(['gemini', 'groq', 'custom'])
  const update = {}

  if (typeof body.activeProvider === 'string' && providers.has(body.activeProvider)) {
    update.activeProvider = body.activeProvider
  }
  if (body.fallbackProvider === 'none' ||
    (typeof body.fallbackProvider === 'string' && providers.has(body.fallbackProvider))) {
    update.fallbackProvider = body.fallbackProvider
  }

  for (const field of ['geminiModel', 'groqModel', 'customModel']) {
    if (typeof body[field] === 'string') {
      const value = body[field].trim()
      if (value && !/^[a-zA-Z0-9._:/-]{1,200}$/.test(value)) {
        throw new Error(`${field} contains unsupported characters`)
      }
      update[field] = value
    }
  }

  if (typeof body.customBaseUrl === 'string') {
    const value = body.customBaseUrl.trim().replace(/\/+$/, '')
    if (value) {
      let url
      try {
        url = new URL(value)
      } catch {
        throw new Error('Custom base URL is invalid')
      }
      const localHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
      if (url.protocol !== 'https:' && !(url.protocol === 'http:' && localHost)) {
        throw new Error('Custom base URL must use HTTPS, except for localhost')
      }
      if (url.username || url.password) throw new Error('Do not put credentials in the custom base URL')
    }
    update.customBaseUrl = value
  }

  for (const field of secretFields) {
    if (typeof body[field] === 'string' && body[field].trim()) {
      if (body[field].length > 1_000) throw new Error(`${field} is too long`)
      update[field] = body[field].trim()
    }
    const clearName = `clear${field.charAt(0).toUpperCase()}${field.slice(1)}`
    if (body[clearName] === true) update[field] = ''
  }

  return update
}

export function providerIsConfigured(vault, provider = vault.activeProvider) {
  if (provider === 'gemini') return Boolean(vault.geminiKey && vault.geminiModel)
  if (provider === 'groq') return Boolean(vault.groqKey && vault.groqModel)
  if (provider === 'custom') {
    const local = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(vault.customBaseUrl)
    return Boolean(vault.customBaseUrl && vault.customModel && (vault.customApiKey || local))
  }
  return false
}
