export type AssistantAction =
  | { type: 'open-url'; url: string; label: string }
  | { type: 'remember'; content: string }
  | { type: 'show-memories' }
  | { type: 'clear-conversation' }
  | { type: 'start-timer'; seconds: number; label: string }
  | { type: 'privacy-lock' }
  | { type: 'create-agent-mission'; objective: string }
  | { type: 'create-reminder'; content: string; dueAt: string; recurrence: 'none' | 'daily' | 'weekly' }

export interface CommandResult {
  handled: boolean
  response?: string
  action?: AssistantAction
}

const sites: Record<string, { url: string; label: string }> = {
  calendar: { url: 'https://calendar.google.com', label: 'Google Calendar' },
  github: { url: 'https://github.com', label: 'GitHub' },
  gmail: { url: 'https://mail.google.com', label: 'Gmail' },
  maps: { url: 'https://maps.google.com', label: 'Google Maps' },
  notion: { url: 'https://notion.so', label: 'Notion' },
  spotify: { url: 'https://open.spotify.com', label: 'Spotify' },
  youtube: { url: 'https://youtube.com', label: 'YouTube' }
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function calculate(expression: string): number {
  const source = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '')
  if (!source || !/^[\d.+\-*/()]+$/.test(source)) throw new Error('Invalid expression')

  let position = 0
  const peek = () => source[position]
  const consume = () => source[position++]

  const parseNumber = (): number => {
    const start = position
    while (/[\d.]/.test(peek() || '')) consume()
    const value = Number(source.slice(start, position))
    if (!Number.isFinite(value)) throw new Error('Invalid number')
    return value
  }

  const parseFactor = (): number => {
    if (peek() === '+') {
      consume()
      return parseFactor()
    }
    if (peek() === '-') {
      consume()
      return -parseFactor()
    }
    if (peek() === '(') {
      consume()
      const value = parseExpression()
      if (consume() !== ')') throw new Error('Missing parenthesis')
      return value
    }
    return parseNumber()
  }

  const parseTerm = (): number => {
    let value = parseFactor()
    while (peek() === '*' || peek() === '/') {
      const operator = consume()
      const right = parseFactor()
      if (operator === '/' && right === 0) throw new Error('Division by zero')
      value = operator === '*' ? value * right : value / right
    }
    return value
  }

  const parseExpression = (): number => {
    let value = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const operator = consume()
      const right = parseTerm()
      value = operator === '+' ? value + right : value - right
    }
    return value
  }

  const result = parseExpression()
  if (position !== source.length || !Number.isFinite(result)) throw new Error('Invalid expression')
  return result
}

export function runLocalCommand(input: string, now = new Date()): CommandResult {
  const command = input.trim()
  const lower = command.toLowerCase().replace(/[?!]+$/, '')

  if (!lower) return { handled: true, response: 'I did not catch that. Try saying it again.' }

  if (/^(hi|hello|hey|hey era|hello era|good (morning|afternoon|evening))$/.test(lower)) {
    return {
      handled: true,
      response: `${greetingForHour(now.getHours())}! I’m right here and happy to help. What would you like to do?`
    }
  }

  if (/^(who are you|what are you|tell me about yourself)$/.test(lower)) {
    return {
      handled: true,
      response:
        'I’m ERA, your gentle voice-first AI companion. I can help you think, learn, plan, remember useful details, start timers, research questions, and safely coordinate everyday tasks.'
    }
  }

  if (/what can you do|help me|show (me )?(commands|capabilities)/.test(lower)) {
    return {
      handled: true,
      response:
        'You can ask me to remember something, start a timer, calculate an expression, search the web, open GitHub, YouTube, Spotify, Gmail, Calendar, Maps, or Notion—and ask general questions when Gemini is connected.'
    }
  }

  const agentMission = command.match(/^(?:start|create|run)(?: a)? multi-agent mission (?:for|to)\s+(.+)/i)
  if (agentMission) {
    const objective = agentMission[1].trim()
    return {
      handled: true,
      response: `I prepared a four-task agent mission for ${objective}. Research and Security can work in parallel while Planning and Synthesis wait for their dependencies.`,
      action: { type: 'create-agent-mission', objective }
    }
  }

  if (/^(?:activate )?(?:emergency )?privacy lock$/.test(lower)) {
    return {
      handled: true,
      response: 'Privacy lock is active. Voice, connected reasoning, overlays, and new memories are paused.',
      action: { type: 'privacy-lock' }
    }
  }

  if (/^(what(?:'s| is) the time|time|current time)$/.test(lower)) {
    return {
      handled: true,
      response: `It’s ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`
    }
  }

  if (/^(what(?:'s| is) (today'?s )?date|date|what day is it|today)$/.test(lower)) {
    return {
      handled: true,
      response: `Today is ${now.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}.`
    }
  }

  const memory = command.match(/^remember(?: that)?\s+(.+)/i)
  if (memory) {
    const content = memory[1].trim()
    return {
      handled: true,
      response: `I’ll remember that: ${content}`,
      action: { type: 'remember', content }
    }
  }

  if (/^(what do you remember|show (me )?my memories|open memory|memories)$/.test(lower)) {
    return {
      handled: true,
      response: 'Opening the details you’ve asked me to remember.',
      action: { type: 'show-memories' }
    }
  }

  if (/^(clear|reset|delete) (the )?(chat|conversation|history)$/.test(lower)) {
    return {
      handled: true,
      response: 'Conversation cleared. We can start fresh.',
      action: { type: 'clear-conversation' }
    }
  }

  const relativeReminder = command.match(/^remind me in (\d{1,4})\s+(second|seconds|minute|minutes|hour|hours|day|days)\s+to\s+(.+)/i)
  if (relativeReminder) {
    const amount = Number(relativeReminder[1])
    const unit = relativeReminder[2].toLowerCase()
    const content = relativeReminder[3].trim()
    const multiplier = unit.startsWith('second')
      ? 1_000
      : unit.startsWith('minute')
        ? 60_000
        : unit.startsWith('hour')
          ? 3_600_000
          : 86_400_000
    const dueAt = new Date(now.getTime() + amount * multiplier)
    return {
      handled: true,
      response: `Okay. I’ll gently remind you to ${content} at ${dueAt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.`,
      action: { type: 'create-reminder', content, dueAt: dueAt.toISOString(), recurrence: 'none' }
    }
  }

  const recurringReminder = command.match(/^remind me (every day|daily|every week|weekly) to\s+(.+)/i)
  if (recurringReminder) {
    const recurrence = recurringReminder[1].toLowerCase().includes('week') ? 'weekly' : 'daily'
    const content = recurringReminder[2].trim()
    const interval = recurrence === 'weekly' ? 7 * 86_400_000 : 86_400_000
    const dueAt = new Date(now.getTime() + interval)
    return {
      handled: true,
      response: `All set. I’ll remind you ${recurrence === 'weekly' ? 'every week' : 'every day'} to ${content}.`,
      action: { type: 'create-reminder', content, dueAt: dueAt.toISOString(), recurrence }
    }
  }

  const timer = lower.match(/^(?:start|set)(?: a)? (\d{1,3})[- ]?(second|seconds|minute|minutes) timer$/)
  if (timer) {
    const amount = Number(timer[1])
    const isMinutes = timer[2].startsWith('minute')
    const seconds = amount * (isMinutes ? 60 : 1)
    const label = `${amount} ${isMinutes ? 'minute' : 'second'}${amount === 1 ? '' : 's'}`
    return {
      handled: true,
      response: `Your ${label} timer starts now. I’ll let you know when it’s done.`,
      action: { type: 'start-timer', seconds, label }
    }
  }

  const search = command.match(/^(?:search(?: the web)? for|google)\s+(.+)/i)
  if (search) {
    const query = search[1].trim()
    return {
      handled: true,
      response: `Searching the web for ${query}.`,
      action: {
        type: 'open-url',
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        label: `search results for ${query}`
      }
    }
  }

  const open = lower.match(/^(?:open|launch|go to)\s+(.+)$/)
  if (open) {
    const destination = open[1].replace(/^my\s+/, '').trim()
    const site = sites[destination]
    if (site) {
      return {
        handled: true,
        response: `Opening ${site.label}.`,
        action: { type: 'open-url', ...site }
      }
    }
  }

  const math = command.match(/^(?:calculate|what is|what's)\s+([\d\s.+\-*/()×÷]+)$/i)
  if (math) {
    try {
      const result = calculate(math[1])
      return { handled: true, response: `The answer is ${Number(result.toFixed(10))}.` }
    } catch {
      return {
        handled: true,
        response: 'I couldn’t calculate that expression. Check the numbers and operators, then try again.'
      }
    }
  }

  if (/^(give me |start )?(my |a )?(morning|daily) brief(ing)?$/.test(lower)) {
    return {
      handled: true,
      response: `${greetingForHour(now.getHours())}. It’s ${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}. Your ERA workspace is ready. Connect Calendar and weather in Automations to add live events and local conditions to this briefing.`
    }
  }

  if (/^(thanks|thank you|nice|great)$/.test(lower)) {
    return {
      handled: true,
      response: 'You’re very welcome. I’ll be right here whenever you need a little help.'
    }
  }

  return { handled: false }
}

export interface CapturedNote {
  id: string
  title: string
  content: string
  createdAt: string
  path: string
}

export async function rememberInNotes(content: string) {
  const response = await fetch('/remember', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { code?: string; error?: string }
    const error = new Error(body.error || 'ERA could not save that memory')
    error.name = body.code || 'MEMORY_CAPTURE_FAILED'
    throw error
  }

  const body = (await response.json()) as { note: CapturedNote }
  return body.note
}

export async function askCloudAssistant(
  messages: Array<{ role: 'user' | 'assistant'; text: string }>,
  route?: { agents: string[]; risk: string; language?: string }
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, route })
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { code?: string; error?: string }
    const error = new Error(body.error || 'ERA could not reach the AI service')
    error.name = body.code || 'AI_REQUEST_FAILED'
    throw error
  }

  const body = (await response.json()) as {
    text: string
    sources?: Array<{ title: string; url: string }>
  }
  return { text: body.text, sources: body.sources || [] }
}

export async function analyzeImage(image: string, prompt: string) {
  const response = await fetch('/api/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, prompt })
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { code?: string; error?: string }
    const error = new Error(body.error || 'ERA could not analyze the image')
    error.name = body.code || 'VISION_REQUEST_FAILED'
    throw error
  }

  const body = (await response.json()) as { text: string }
  return body.text
}
