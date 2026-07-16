import 'dotenv/config'
import { iso6393 } from 'iso-639-3'
import { createServer } from 'node:http'
import { lstat, mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import { basename, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  allowedAgents,
  buildPersonaSystemInstruction,
  personaVersion
} from './lib/persona-system.mjs'
import {
  providerIsConfigured,
  publicProviderSettings,
  readProviderVault,
  sanitizeProviderUpdate,
  writeProviderVault
} from './lib/provider-vault.mjs'

const moduleDirectory = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = resolve(moduleDirectory, '../..')
const dist = join(projectRoot, 'dist')
const port = Number(process.env.PORT || 8787)
const notesDirectory = resolve(projectRoot, process.env.NOTES_DIR || 'resources/notes')

const speechRegionDefaults = {
  ar: 'ar-SA', bn: 'bn-BD', de: 'de-DE', en: 'en-US', es: 'es-ES', fa: 'fa-IR',
  fil: 'fil-PH', fr: 'fr-FR', gu: 'gu-IN', he: 'he-IL', hi: 'hi-IN', id: 'id-ID',
  it: 'it-IT', ja: 'ja-JP', kn: 'kn-IN', ko: 'ko-KR', ml: 'ml-IN', mr: 'mr-IN',
  ms: 'ms-MY', ne: 'ne-NP', nl: 'nl-NL', pa: 'pa-IN', pl: 'pl-PL', pt: 'pt-BR',
  ru: 'ru-RU', si: 'si-LK', sw: 'sw-KE', ta: 'ta-IN', te: 'te-IN', th: 'th-TH',
  tr: 'tr-TR', uk: 'uk-UA', ur: 'ur-PK', vi: 'vi-VN', yue: 'yue-HK', zh: 'zh-CN'
}

const iso3SpeechAliases = {
  arb: 'ar-SA', arz: 'ar-EG', cmn: 'zh-CN', eng: 'en-US', hin: 'hi-IN',
  npi: 'ne-NP', nep: 'ne-NP', spa: 'es-ES', yue: 'yue-HK'
}

const knownBrowserSpeechLanguages = new Set([
  'ar', 'bn', 'de', 'en', 'es', 'fa', 'fil', 'fr', 'gu', 'he', 'hi', 'id', 'it',
  'ja', 'kn', 'ko', 'ml', 'mr', 'ms', 'ne', 'nl', 'pa', 'pl', 'pt', 'ru', 'si',
  'sw', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'yue', 'zh'
])

const featuredLanguageIds = [
  'eng', 'npi', 'hin', 'urd', 'ben', 'spa', 'fra', 'deu', 'por', 'ita', 'jpn',
  'kor', 'cmn', 'yue', 'arb', 'rus', 'ukr', 'tur', 'tam', 'tel', 'mar', 'guj',
  'pan', 'mal', 'kan', 'sin', 'ind', 'vie', 'tha', 'swa'
]

function speechTagForLanguage(language) {
  return iso3SpeechAliases[language.iso6393] ||
    speechRegionDefaults[language.iso6391] ||
    language.iso6391 ||
    language.iso6393
}

function publicLanguage(language) {
  const tag = speechTagForLanguage(language)
  const base = (language.iso6391 || tag.split('-')[0]).toLowerCase()
  return {
    name: language.name,
    id: language.iso6393,
    iso6391: language.iso6391 || null,
    speechTag: tag,
    type: language.type,
    scope: language.scope,
    voiceSupport: knownBrowserSpeechLanguages.has(base)
      ? 'common-browser-support'
      : language.iso6391
        ? 'browser-dependent'
        : 'catalog-only'
  }
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  })
  response.end(JSON.stringify(body))
}

async function readJson(request, maxLength = 100_000) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > maxLength) throw new Error('Request is too large')
  }
  return JSON.parse(body || '{}')
}

function cleanConversationMessages(rawMessages) {
  return rawMessages
    .filter(
      (message) =>
        message &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.text === 'string'
    )
    .map((message) => ({
      role: message.role,
      text: message.text.slice(0, 80_000)
    }))
}

async function requestGemini(vault, messages, selectedAgents, maxOutputTokens = 600, responseLanguage = '') {
  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.text }]
  }))
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(vault.geminiModel)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': vault.geminiKey
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildPersonaSystemInstruction(selectedAgents, responseLanguage) }]
        },
        contents,
        ...(selectedAgents.includes('research') ? { tools: [{ google_search: {} }] } : {}),
        generationConfig: { temperature: 0.65, maxOutputTokens }
      }),
      signal: AbortSignal.timeout(25_000)
    }
  )
  const data = await upstream.json()
  if (!upstream.ok) {
    console.error('Gemini request failed:', upstream.status, data?.error?.message || 'Unknown error')
    throw new Error('The Gemini provider could not complete that request')
  }
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('\n')
    .trim()
  const groundingChunks = data?.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  const sources = groundingChunks
    .map((chunk) => chunk?.web)
    .filter((source) => source?.uri)
    .filter((source, index, list) => list.findIndex((item) => item.uri === source.uri) === index)
    .slice(0, 5)
    .map((source) => ({ title: source.title || 'Source', url: source.uri }))
  if (!text) throw new Error('Gemini returned an empty response')
  return { text, sources }
}

async function requestOpenAICompatible(vault, provider, messages, selectedAgents, maxOutputTokens = 600, responseLanguage = '') {
  const isGroq = provider === 'groq'
  const baseUrl = isGroq
    ? 'https://api.groq.com/openai/v1'
    : vault.customBaseUrl.replace(/\/+$/, '')
  const endpoint = baseUrl.endsWith('/chat/completions')
    ? baseUrl
    : `${baseUrl}/chat/completions`
  const apiKey = isGroq ? vault.groqKey : vault.customApiKey
  const modelName = isGroq ? vault.groqModel : vault.customModel
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`

  const upstream = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: buildPersonaSystemInstruction(selectedAgents, responseLanguage) },
        ...messages.map((message) => ({ role: message.role, content: message.text }))
      ],
      temperature: 0.65,
      max_tokens: maxOutputTokens,
      stream: false
    }),
    signal: AbortSignal.timeout(25_000)
  })
  const data = await upstream.json().catch(() => ({}))
  if (!upstream.ok) {
    console.error(`${isGroq ? 'Groq' : 'Custom AI'} request failed:`, upstream.status, data?.error?.message || 'Unknown error')
    throw new Error(`${isGroq ? 'Groq' : 'The custom AI provider'} could not complete that request`)
  }
  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('The AI provider returned an empty response')
  return { text, sources: [] }
}

async function requestSingleProvider(vault, provider, messages, selectedAgents, maxOutputTokens, responseLanguage) {
  if (!providerIsConfigured(vault, provider)) {
    const error = new Error(`${provider} provider is not configured`)
    error.code = 'PROVIDER_NOT_CONFIGURED'
    throw error
  }
  if (provider === 'gemini') {
    return { ...(await requestGemini(vault, messages, selectedAgents, maxOutputTokens, responseLanguage)), provider }
  }
  return {
    ...(await requestOpenAICompatible(vault, provider, messages, selectedAgents, maxOutputTokens, responseLanguage)),
    provider
  }
}

async function requestConfiguredProvider(vault, messages, selectedAgents, maxOutputTokens = 600, responseLanguage = '') {
  const primary = vault.activeProvider
  try {
    return await requestSingleProvider(vault, primary, messages, selectedAgents, maxOutputTokens, responseLanguage)
  } catch (primaryError) {
    const fallback = vault.fallbackProvider
    if (!fallback || fallback === 'none' || fallback === primary || !providerIsConfigured(vault, fallback)) {
      throw primaryError
    }
    console.warn(`Primary provider ${primary} failed; trying configured fallback ${fallback}`)
    const result = await requestSingleProvider(vault, fallback, messages, selectedAgents, maxOutputTokens, responseLanguage)
    return { ...result, fallbackFrom: primary }
  }
}

async function chat(request, response) {
  try {
    const body = await readJson(request)
    const rawMessages = Array.isArray(body.messages) ? body.messages.slice(-12) : []
    const selectedAgents = Array.isArray(body.route?.agents)
      ? body.route.agents.filter((agent) => allowedAgents.includes(agent)).slice(0, 5)
      : []
    const responseLanguage = typeof body.route?.language === 'string' &&
      /^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8}){0,2}$/.test(body.route.language)
      ? body.route.language
      : ''
    const messages = cleanConversationMessages(rawMessages)
    if (!messages.length) {
      sendJson(response, 400, { error: 'At least one message is required' })
      return
    }
    const vault = await readProviderVault()
    const result = await requestConfiguredProvider(vault, messages, selectedAgents, 600, responseLanguage)
    sendJson(response, 200, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (error?.code === 'PROVIDER_NOT_CONFIGURED') {
      sendJson(response, 503, { error: message, code: 'PROVIDER_NOT_CONFIGURED' })
      return
    }
    const status = message === 'Request is too large' ? 413 : 502
    console.error('Chat request failed:', message)
    sendJson(response, status, { error: status === 413 ? message : 'The configured AI provider could not complete that request' })
  }
}

const sensitiveMemoryPattern = /\b(password|passcode|api key|secret key|private key|access token|refresh token|seed phrase|recovery phrase|credit card|card number|cvv)\b\s*(?:is|=|:)\s*["']?\S{4,}/i
const privateKeyBlockPattern = /-----BEGIN [A-Z ]*PRIVATE KEY-----/
const paymentCardPattern = /\b(?:\d[ -]*?){13,19}\b/

function containsSensitiveMemory(content) {
  return sensitiveMemoryPattern.test(content) ||
    privateKeyBlockPattern.test(content) ||
    paymentCardPattern.test(content)
}

function createCaptureTitle(content) {
  const words = content.match(/[\p{L}\p{N}'’-]+/gu) || []
  const selected = words.slice(0, 5).join(' ')
  if (!selected) return 'Untitled thought'
  return selected.charAt(0).toLocaleUpperCase() + selected.slice(1)
}

function createCaptureSlug(title) {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 58)
  return slug || 'captured-thought'
}

async function rememberCapture(request, response) {
  try {
    const body = await readJson(request, 30_000)
    const rawContent = typeof body.content === 'string' ? body.content.trim() : ''
    const content = rawContent.replace(/^remember\s+that\s+/i, '').trim()

    if (!content) {
      sendJson(response, 400, { error: 'A memory is required' })
      return
    }

    if (content.length > 20_000) {
      sendJson(response, 413, { error: 'Memory is too long' })
      return
    }

    if (containsSensitiveMemory(content)) {
      sendJson(response, 422, {
        error: 'ERA will not store credentials or highly sensitive secrets as memory',
        code: 'SENSITIVE_MEMORY_REJECTED'
      })
      return
    }

    const title = createCaptureTitle(content)
    const createdAt = new Date().toISOString()
    const timestamp = createdAt.replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')
    const filename = `${timestamp}_${createCaptureSlug(title)}.md`
    const capturesDirectory = join(notesDirectory, 'captures')
    const absolutePath = join(capturesDirectory, filename)
    const markdown = `---\ntitle: ${JSON.stringify(title)}\ncreated: ${JSON.stringify(createdAt)}\nsource: ERA voice capture\ntype: memory\n---\n\n# ${title}\n\n${content}\n`

    await mkdir(capturesDirectory, { recursive: true })
    await writeFile(absolutePath, markdown, { encoding: 'utf8', flag: 'wx', mode: 0o600 })

    sendJson(response, 201, {
      note: {
        id: `capture:${filename}`,
        title,
        content,
        createdAt,
        path: `captures/${filename}`
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = message === 'Request is too large' ? 413 : 500
    console.error('Memory capture failed:', message)
    sendJson(response, status, {
      error: status === 413 ? message : 'ERA could not write that memory to the notes directory'
    })
  }
}

function notesCaptureDirectory() {
  return join(notesDirectory, 'captures')
}

function safeNotePath(filename) {
  const clean = basename(filename)
  if (clean !== filename || !clean.endsWith('.md') || clean.length > 180) {
    throw new Error('Invalid note filename')
  }
  return join(notesCaptureDirectory(), clean)
}

function parseFrontmatterValue(markdown, field) {
  const match = markdown.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))
  if (!match) return ''
  try {
    return JSON.parse(match[1])
  } catch {
    return match[1].replace(/^['"]|['"]$/g, '')
  }
}

function parseMarkdownNote(filename, markdown, modifiedAt) {
  const title = parseFrontmatterValue(markdown, 'title') ||
    markdown.match(/^#\s+(.+)$/m)?.[1] ||
    filename.replace(/\.md$/, '').replace(/[_-]+/g, ' ')
  const createdAt = parseFrontmatterValue(markdown, 'created') || modifiedAt
  const source = parseFrontmatterValue(markdown, 'source') || 'Local Markdown'
  const type = parseFrontmatterValue(markdown, 'type') || 'note'
  let content = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
  const heading = new RegExp(`^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n?`)
  content = content.replace(heading, '').trim()
  return { filename, title, content, createdAt, modifiedAt, source, type }
}

function markdownForNote(title, content, createdAt) {
  return `---\ntitle: ${JSON.stringify(title)}\ncreated: ${JSON.stringify(createdAt)}\nsource: ERA memory bank\ntype: note\n---\n\n# ${title}\n\n${content.trim()}\n`
}

function validateManualNote(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (!title || !content) throw new Error('A note title and content are required')
  if (title.length > 180) throw new Error('Note title is too long')
  if (content.length > 100_000) throw new Error('Note content is too long')
  if (containsSensitiveMemory(`${title}\n${content}`)) {
    const error = new Error('ERA will not store credentials or highly sensitive secrets in notes')
    error.code = 'SENSITIVE_MEMORY_REJECTED'
    throw error
  }
  return { title, content }
}

const localSearchStopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is',
  'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'with'
])

function searchTerms(value) {
  return (value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
    .filter((term) => term.length > 1 && !localSearchStopWords.has(term))
}

function noteRelatedness(left, right) {
  const leftTerms = new Set(searchTerms(`${left.title} ${left.content}`))
  const rightTerms = new Set(searchTerms(`${right.title} ${right.content}`))
  if (!leftTerms.size || !rightTerms.size) return 0
  let shared = 0
  for (const term of leftTerms) if (rightTerms.has(term)) shared += 1
  return shared / Math.sqrt(leftTerms.size * rightTerms.size)
}

async function readAllNotes() {
  const directory = notesCaptureDirectory()
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const entries = await readdir(directory, { withFileTypes: true })
  const notes = []
  for (const entry of entries.filter((item) => item.isFile() && item.name.endsWith('.md')).slice(0, 500)) {
    const path = safeNotePath(entry.name)
    const [markdown, info] = await Promise.all([readFile(path, 'utf8'), stat(path)])
    notes.push(parseMarkdownNote(entry.name, markdown, info.mtime.toISOString()))
  }
  notes.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  return notes.map((note) => ({
    ...note,
    related: notes
      .filter((candidate) => candidate.filename !== note.filename)
      .map((candidate) => ({
        filename: candidate.filename,
        title: candidate.title,
        score: noteRelatedness(note, candidate)
      }))
      .filter((candidate) => candidate.score > 0.08)
      .sort((left, right) => right.score - left.score)
      .slice(0, 4)
  }))
}

function noteSearchScore(note, query) {
  const phrase = query.toLocaleLowerCase()
  const title = note.title.toLocaleLowerCase()
  const content = note.content.toLocaleLowerCase()
  const terms = [...new Set(searchTerms(query))]
  let score = title === phrase ? 18 : title.includes(phrase) ? 10 : content.includes(phrase) ? 5 : 0
  for (const term of terms) {
    if (title.split(/\s+/).includes(term)) score += 4
    else if (title.includes(term)) score += 2.5
    const matches = content.split(term).length - 1
    score += Math.min(matches, 6) * 0.7
  }
  return score
}

function noteSnippet(note, query) {
  const clean = note.content.replace(/[#>*_`\[\]]/g, ' ').replace(/\s+/g, ' ').trim()
  const position = clean.toLocaleLowerCase().indexOf(query.toLocaleLowerCase())
  const start = position < 0 ? 0 : Math.max(position - 60, 0)
  const snippet = clean.slice(start, start + 190)
  return `${start > 0 ? '…' : ''}${snippet}${start + 190 < clean.length ? '…' : ''}`
}

async function listNotes(response) {
  try {
    sendJson(response, 200, { notes: await readAllNotes() })
  } catch (error) {
    console.error('Notes list failed:', error instanceof Error ? error.message : error)
    sendJson(response, 500, { error: 'ERA could not read the notes directory' })
  }
}

async function searchNotes(url, response) {
  try {
    const query = (url.searchParams.get('q') || '').trim().slice(0, 200)
    if (query.length < 2) {
      sendJson(response, 200, { query, results: [] })
      return
    }
    const results = (await readAllNotes())
      .map((note) => ({ ...note, score: noteSearchScore(note, query) }))
      .filter((note) => note.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 20)
      .map((note) => ({
        filename: note.filename,
        title: note.title,
        snippet: noteSnippet(note, query),
        score: Number(note.score.toFixed(2)),
        source: note.source,
        type: note.type,
        createdAt: note.createdAt
      }))
    sendJson(response, 200, { query, results })
  } catch (error) {
    console.error('Notes search failed:', error instanceof Error ? error.message : error)
    sendJson(response, 500, { error: 'ERA could not search the notes directory' })
  }
}

async function createManualNote(request, response) {
  try {
    const { title, content } = validateManualNote(await readJson(request, 120_000))
    const createdAt = new Date().toISOString()
    const timestamp = createdAt.replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')
    const filename = `${timestamp}_${createCaptureSlug(title)}.md`
    const directory = notesCaptureDirectory()
    await mkdir(directory, { recursive: true, mode: 0o700 })
    await writeFile(safeNotePath(filename), markdownForNote(title, content, createdAt), {
      encoding: 'utf8', flag: 'wx', mode: 0o600
    })
    sendJson(response, 201, { note: { filename, title, content, createdAt } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Note could not be created'
    sendJson(response, error?.code === 'SENSITIVE_MEMORY_REJECTED' ? 422 : 400, {
      error: message,
      ...(error?.code ? { code: error.code } : {})
    })
  }
}

async function updateManualNote(filename, request, response) {
  try {
    const { title, content } = validateManualNote(await readJson(request, 120_000))
    const path = safeNotePath(filename)
    const info = await lstat(path)
    if (!info.isFile() || info.isSymbolicLink()) throw new Error('Note is not a regular file')
    const existing = parseMarkdownNote(filename, await readFile(path, 'utf8'), info.mtime.toISOString())
    await writeFile(path, markdownForNote(title, content, existing.createdAt), {
      encoding: 'utf8', mode: 0o600
    })
    sendJson(response, 200, { note: { filename, title, content, createdAt: existing.createdAt } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Note could not be updated'
    sendJson(response, error?.code === 'SENSITIVE_MEMORY_REJECTED' ? 422 : 400, { error: message })
  }
}

async function deleteManualNote(filename, response) {
  try {
    const path = safeNotePath(filename)
    const info = await lstat(path)
    if (!info.isFile() || info.isSymbolicLink()) throw new Error('Note is not a regular file')
    await unlink(path)
    sendJson(response, 200, { deleted: filename })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Note could not be deleted'
    sendJson(response, 400, { error: message })
  }
}

async function analyzeVision(request, response) {
  try {
    const vault = await readProviderVault()
    if (!vault.geminiKey || !vault.geminiModel) {
      sendJson(response, 503, {
        error: 'Gemini is required for vision and is not configured',
        code: 'PROVIDER_NOT_CONFIGURED'
      })
      return
    }
    const body = await readJson(request, 11_000_000)
    const image = typeof body.image === 'string' ? body.image : ''
    const match = image.match(/^data:image\/(png|jpeg|webp);base64,([a-zA-Z0-9+/=]+)$/)
    if (!match || match[2].length > 10_000_000) {
      sendJson(response, 400, { error: 'Provide a PNG, JPEG, or WebP image under 7 MB' })
      return
    }

    const mimeType = `image/${match[1]}`
    const prompt = typeof body.prompt === 'string' && body.prompt.trim()
      ? body.prompt.trim().slice(0, 4_000)
      : 'Describe the visible content, extract important text, and suggest the most useful next action.'

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(vault.geminiModel)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': vault.geminiKey
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: buildPersonaSystemInstruction(['screen', 'security', 'knowledge']) }]
          },
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType, data: match[2] } }
              ]
            }
          ],
          generationConfig: { temperature: 0.35, maxOutputTokens: 900 }
        }),
        signal: AbortSignal.timeout(30_000)
      }
    )

    const data = await upstream.json()
    if (!upstream.ok) {
      console.error('Gemini vision request failed:', upstream.status, data?.error?.message || 'Unknown error')
      sendJson(response, 502, { error: 'The vision provider could not analyze that image' })
      return
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('\n')
      .trim()

    if (!text) {
      sendJson(response, 502, { error: 'The vision provider returned an empty response' })
      return
    }

    sendJson(response, 200, { text })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = message === 'Request is too large' ? 413 : 500
    console.error('Vision request failed:', message)
    sendJson(response, status, { error: status === 413 ? message : 'Unable to analyze the image' })
  }
}

function searchLanguages(url, response) {
  const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase().slice(0, 100)
  const requestedLimit = Number(url.searchParams.get('limit') || 40)
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 40
  const baseQuery = query.split('-')[0]
  const languageScore = (language) => {
    const name = language.name.toLocaleLowerCase()
    const id = language.iso6393.toLocaleLowerCase()
    const iso1 = language.iso6391?.toLocaleLowerCase()
    const tag = speechTagForLanguage(language).toLocaleLowerCase()
    if (id === query) return 120
    if (iso1 === query || iso1 === baseQuery) return 115
    if (tag === query) return 110
    if (name === query) return 105
    if (name.startsWith(query)) return 75
    if (name.includes(query)) return 45
    if (id.includes(query)) return 20
    return 0
  }
  const matches = query
    ? iso6393
        .map((language) => ({ language, score: languageScore(language) }))
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score || left.language.name.localeCompare(right.language.name))
        .map((item) => item.language)
    : featuredLanguageIds
        .map((id) => iso6393.find((language) => language.iso6393 === id))
        .filter(Boolean)
  sendJson(response, 200, {
    query,
    catalogSize: iso6393.length,
    results: matches.slice(0, limit).map(publicLanguage)
  })
}

async function getProviderSettings(response) {
  try {
    const vault = await readProviderVault()
    sendJson(response, 200, publicProviderSettings(vault))
  } catch (error) {
    console.error('Provider settings read failed:', error instanceof Error ? error.message : error)
    sendJson(response, 500, { error: 'The encrypted provider vault could not be opened' })
  }
}

async function saveProviderSettings(request, response) {
  try {
    const body = await readJson(request, 50_000)
    const update = sanitizeProviderUpdate(body)
    const vault = await writeProviderVault(update)
    sendJson(response, 200, {
      ...publicProviderSettings(vault),
      message: 'Provider settings encrypted and saved locally'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid provider settings'
    console.error('Provider settings save failed:', message)
    sendJson(response, 400, { error: message })
  }
}

async function testProviderSettings(response) {
  try {
    const vault = await readProviderVault()
    const result = await requestConfiguredProvider(
      vault,
      [{ role: 'user', text: 'Reply with exactly ERA_OK.' }],
      ['voice'],
      20
    )
    sendJson(response, 200, {
      ok: true,
      provider: result.provider,
      fallbackFrom: result.fallbackFrom || null,
      model: result.provider === 'gemini'
        ? vault.geminiModel
        : result.provider === 'groq'
          ? vault.groqModel
          : vault.customModel,
      receivedResponse: Boolean(result.text)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Provider test failed'
    sendJson(response, 502, { error: message })
  }
}

async function serveStatic(request, response) {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  const requestedPath = decodeURIComponent(url.pathname)
  const relativePath = normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, '')
  let filePath = join(dist, relativePath === '/' ? 'index.html' : relativePath)

  try {
    const info = await stat(filePath)
    if (info.isDirectory()) filePath = join(filePath, 'index.html')
  } catch {
    filePath = join(dist, 'index.html')
  }

  try {
    const file = await readFile(filePath)
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    })
    response.end(file)
  } catch {
    sendJson(response, 404, { error: 'Build not found. Run npm run build first.' })
  }
}

const server = createServer(async (request, response) => {
  const method = request.method || 'GET'
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  const path = requestUrl.pathname

  if (path === '/api/health' && method === 'GET') {
    try {
      const vault = await readProviderVault()
      sendJson(response, 200, {
        status: 'ok',
        providerConfigured: providerIsConfigured(vault) ||
          (vault.fallbackProvider !== 'none' && providerIsConfigured(vault, vault.fallbackProvider)),
        activeProvider: vault.activeProvider,
        runtime: 'Persona Voice AI OS',
        version: personaVersion
      })
    } catch {
      sendJson(response, 200, {
        status: 'degraded',
        providerConfigured: false,
        runtime: 'Persona Voice AI OS',
        version: personaVersion
      })
    }
    return
  }

  if (path === '/api/settings/providers' && method === 'GET') {
    await getProviderSettings(response)
    return
  }

  if (path === '/api/settings/providers' && method === 'PUT') {
    await saveProviderSettings(request, response)
    return
  }

  if (path === '/api/settings/providers/test' && method === 'POST') {
    await testProviderSettings(response)
    return
  }

  if (path === '/api/languages' && method === 'GET') {
    searchLanguages(requestUrl, response)
    return
  }

  if (path === '/api/search' && method === 'GET') {
    await searchNotes(requestUrl, response)
    return
  }

  if (path === '/api/notes' && method === 'GET') {
    await listNotes(response)
    return
  }

  if (path === '/api/notes' && method === 'POST') {
    await createManualNote(request, response)
    return
  }

  if (path.startsWith('/api/notes/')) {
    let filename
    try {
      filename = decodeURIComponent(path.slice('/api/notes/'.length))
    } catch {
      sendJson(response, 400, { error: 'Invalid note filename encoding' })
      return
    }
    if (method === 'PUT') {
      await updateManualNote(filename, request, response)
      return
    }
    if (method === 'DELETE') {
      await deleteManualNote(filename, response)
      return
    }
  }

  if (path === '/remember' && method === 'POST') {
    await rememberCapture(request, response)
    return
  }

  if (path === '/api/chat' && method === 'POST') {
    await chat(request, response)
    return
  }

  if (path === '/api/vision' && method === 'POST') {
    await analyzeVision(request, response)
    return
  }

  if (path.startsWith('/api/')) {
    sendJson(response, 404, { error: 'API route not found' })
    return
  }

  if (method !== 'GET' && method !== 'HEAD') {
    sendJson(response, 405, { error: 'Method not allowed' })
    return
  }

  await serveStatic(request, response)
})

server.listen(port, async () => {
  console.log(`ERA server listening on http://localhost:${port}`)
  try {
    const vault = await readProviderVault()
    const configured = providerIsConfigured(vault) ||
      (vault.fallbackProvider !== 'none' && providerIsConfigured(vault, vault.fallbackProvider))
    console.log(configured
      ? `${vault.activeProvider} provider route enabled`
      : 'AI provider not configured — local commands remain available')
  } catch {
    console.log('Provider vault unavailable — local commands remain available')
  }
})
