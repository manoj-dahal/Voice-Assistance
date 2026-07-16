import { Check, Languages, Search, Volume2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

interface LanguageOption {
  name: string
  id: string
  iso6391: string | null
  speechTag: string
  type: string
  scope: string
  voiceSupport: 'common-browser-support' | 'browser-dependent' | 'catalog-only'
}

interface LanguagePickerProps {
  value: string
  voices: SpeechSynthesisVoice[]
  onChange: (speechTag: string) => void
}

const supportCopy = {
  'common-browser-support': 'Common browser support',
  'browser-dependent': 'Browser dependent',
  'catalog-only': 'Catalog only · voice engine required'
}

export function LanguagePicker({ value, voices, onChange }: LanguagePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LanguageOption[]>([])
  const [catalogSize, setCatalogSize] = useState(0)
  const [selected, setSelected] = useState<LanguageOption | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/languages?q=${encodeURIComponent(value)}&limit=10`, { signal: controller.signal })
      .then((response) => response.json())
      .then((body) => {
        const options = Array.isArray(body.results) ? body.results as LanguageOption[] : []
        setSelected(options.find((option) => option.speechTag.toLowerCase() === value.toLowerCase()) || options[0] || null)
        setCatalogSize(Number(body.catalogSize) || 0)
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [value])

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    setLoading(true)
    const timer = window.setTimeout(() => {
      fetch(`/api/languages?q=${encodeURIComponent(query)}&limit=60`, { signal: controller.signal })
        .then((response) => response.json())
        .then((body) => {
          setResults(Array.isArray(body.results) ? body.results : [])
          setCatalogSize(Number(body.catalogSize) || 0)
        })
        .catch((error) => {
          if (!(error instanceof Error && error.name === 'AbortError')) setResults([])
        })
        .finally(() => setLoading(false))
    }, 150)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [open, query])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [])

  const installedVoice = useMemo(() => {
    const desired = value.toLocaleLowerCase()
    const base = desired.split('-')[0]
    return voices.find((voice) => {
      const language = voice.lang.toLocaleLowerCase()
      return language === desired || language.split('-')[0] === base
    })
  }, [value, voices])

  const choose = (option: LanguageOption) => {
    setSelected(option)
    onChange(option.speechTag)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="language-picker" ref={rootRef}>
      <button type="button" className="language-picker-trigger" onClick={() => setOpen((current) => !current)}>
        <Languages size={15} />
        <span><strong>{selected?.name || value}</strong><small>{value} · {installedVoice ? `Voice: ${installedVoice.name}` : selected ? supportCopy[selected.voiceSupport] : 'Browser dependent'}</small></span>
      </button>
      {open && (
        <div className="language-picker-popover">
          <header><div><Languages size={15} /><span><strong>Voice language catalog</strong><small>{catalogSize.toLocaleString()} ISO 639-3 entries</small></span></div><button type="button" onClick={() => setOpen(false)}><X size={14} /></button></header>
          <label><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search language name or ISO code…" autoFocus /></label>
          <div className="language-results">
            {loading ? <div className="language-empty">Searching language catalog…</div> : results.length === 0 ? <div className="language-empty">No matching language.</div> : results.map((option) => (
              <button type="button" className={option.speechTag === value ? 'selected' : ''} key={`${option.id}:${option.name}`} onClick={() => choose(option)}>
                <span><strong>{option.name}</strong><small>{option.id} · {option.type} · {option.scope}</small></span>
                <i className={option.voiceSupport}>{supportCopy[option.voiceSupport]}</i>
                {option.speechTag === value && <Check size={13} />}
              </button>
            ))}
          </div>
          <footer><Volume2 size={13} /><span>Recognition and speech depend on the browser, operating system, and installed voices. Catalog presence does not guarantee audio support.</span></footer>
        </div>
      )}
    </div>
  )
}
