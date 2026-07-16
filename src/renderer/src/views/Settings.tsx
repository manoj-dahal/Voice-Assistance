import {
  BrainCircuit,
  CheckCircle2,
  Cloud,
  Globe2,
  KeyRound,
  Loader2,
  Play,
  Plug,
  Save,
  Shield,
  Terminal,
  Volume2,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { EraSettings } from '../lib/storage'
import { createEraUtterance } from '../lib/voice'
import { LanguagePicker } from '../components/LanguagePicker'

type SettingsTab = 'providers' | 'voice' | 'privacy'
type ProviderName = 'gemini' | 'groq' | 'custom'

interface ProviderSettings {
  activeProvider: ProviderName
  fallbackProvider: ProviderName | 'none'
  geminiModel: string
  groqModel: string
  customBaseUrl: string
  customModel: string
  keyStatus: {
    gemini: 'saved' | 'missing'
    groq: 'saved' | 'missing'
    huggingFace: 'saved' | 'missing'
    tavily: 'saved' | 'missing'
    custom: 'saved' | 'missing'
  }
  vaultProtection: 'environment-secret' | 'local-key-file'
}

interface SettingsModalProps {
  settings: EraSettings
  providerConnected: boolean
  onChange: (settings: EraSettings) => void
  onClose: () => void
  onClearConversation: () => void
  onPrivacyLock: () => void
  onProviderStatusChange?: (configured: boolean) => void
}

const providerDefaults: ProviderSettings = {
  activeProvider: 'gemini',
  fallbackProvider: 'none',
  geminiModel: 'gemini-2.5-flash',
  groqModel: 'llama-3.3-70b-versatile',
  customBaseUrl: '',
  customModel: '',
  keyStatus: {
    gemini: 'missing',
    groq: 'missing',
    huggingFace: 'missing',
    tavily: 'missing',
    custom: 'missing'
  },
  vaultProtection: 'local-key-file'
}

export function SettingsModal({
  settings,
  providerConnected,
  onChange,
  onClose,
  onClearConversation,
  onPrivacyLock,
  onProviderStatusChange
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('providers')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [providers, setProviders] = useState<ProviderSettings>(providerDefaults)
  const [keys, setKeys] = useState({
    geminiKey: '',
    groqKey: '',
    huggingFaceKey: '',
    tavilyKey: '',
    customApiKey: ''
  })
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [savingProviders, setSavingProviders] = useState(false)
  const [testingProvider, setTestingProvider] = useState(false)
  const [providerNotice, setProviderNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() || [])
    loadVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/settings/providers', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not open provider vault')
        return response.json()
      })
      .then((value: ProviderSettings) => setProviders({ ...providerDefaults, ...value }))
      .catch((error) => {
        if (error instanceof Error && error.name !== 'AbortError') {
          setProviderNotice({ kind: 'error', text: error.message })
        }
      })
      .finally(() => setLoadingProviders(false))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const previewVoice = () => {
    window.speechSynthesis.cancel()
    const preview = createEraUtterance(
      'Hi! I’m ERA. I’m right here, and I’ll be happy to help you.',
      settings,
      voices
    )
    window.speechSynthesis.speak(preview)
  }

  const saveProviders = async () => {
    setSavingProviders(true)
    setProviderNotice(null)
    try {
      const response = await fetch('/api/settings/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...providers, ...keys })
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Provider settings could not be saved')
      setProviders({ ...providerDefaults, ...body })
      setKeys({ geminiKey: '', groqKey: '', huggingFaceKey: '', tavilyKey: '', customApiKey: '' })
      const activeStatus = body.activeProvider === 'custom'
        ? Boolean(body.customBaseUrl && body.customModel && (body.keyStatus.custom === 'saved' || /^http:\/\/(localhost|127\.0\.0\.1)/i.test(body.customBaseUrl)))
        : body.keyStatus[body.activeProvider] === 'saved'
      onProviderStatusChange?.(activeStatus)
      setProviderNotice({ kind: 'success', text: 'Keys encrypted and provider settings saved to the local vault.' })
    } catch (error) {
      setProviderNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Save failed' })
    } finally {
      setSavingProviders(false)
    }
  }

  const testProvider = async () => {
    setTestingProvider(true)
    setProviderNotice(null)
    try {
      const response = await fetch('/api/settings/providers/test', { method: 'POST' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Connection test failed')
      setProviderNotice({ kind: 'success', text: `${body.provider} responded successfully using ${body.model}.` })
      onProviderStatusChange?.(true)
    } catch (error) {
      setProviderNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Connection test failed' })
    } finally {
      setTestingProvider(false)
    }
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Plug }> = [
    { id: 'providers', label: 'AI Providers', icon: Plug },
    { id: 'voice', label: 'Voice', icon: Volume2 },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  const keyPlaceholder = (status: 'saved' | 'missing', example: string) =>
    status === 'saved' ? 'Saved securely ••••••••' : example

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="settings-modal provider-settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div className="settings-identity">
            <span>ERA CONTROL CENTER</span>
            <h2 id="settings-title">Settings</h2>
            <small><i className={providerConnected ? 'online' : ''} /> {providerConnected ? 'AI provider online' : 'Local systems online'}</small>
          </div>
          <button type="button" onClick={onClose} aria-label="Close settings"><X size={18} /></button>
        </header>

        <nav className="settings-tabs" aria-label="Settings sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button type="button" className={activeTab === id ? 'active' : ''} key={id} onClick={() => setActiveTab(id)}><Icon size={15} /> {label}</button>
          ))}
        </nav>

        <div className="settings-body">
          {activeTab === 'providers' && (
            <div className="provider-settings-view">
              <div className="provider-view-heading">
                <div><KeyRound size={20} /><span><strong>API Providers</strong><small>Choose one reasoning engine. Empty key fields preserve existing secrets.</small></span></div>
                <div className="provider-actions">
                  <button type="button" className="test-provider-button" onClick={testProvider} disabled={testingProvider || savingProviders}>{testingProvider ? <Loader2 size={14} className="spin" /> : <Terminal size={14} />} Test</button>
                  <button type="button" className="save-provider-button" onClick={saveProviders} disabled={savingProviders || loadingProviders}>{savingProviders ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save vault</button>
                </div>
              </div>

              {providerNotice && <div className={`provider-notice ${providerNotice.kind}`}>{providerNotice.kind === 'success' ? <CheckCircle2 size={14} /> : <Shield size={14} />} {providerNotice.text}</div>}

              <div className="provider-routing-selects">
                <label className="active-provider-select">
                  <span>Active reasoning provider</span>
                  <select value={providers.activeProvider} onChange={(event) => setProviders((current) => ({ ...current, activeProvider: event.target.value as ProviderName }))}>
                    <option value="gemini">Google Gemini</option>
                    <option value="groq">Groq Cloud</option>
                    <option value="custom">Custom OpenAI-compatible API</option>
                  </select>
                </label>
                <label className="active-provider-select">
                  <span>Failure fallback</span>
                  <select value={providers.fallbackProvider} onChange={(event) => setProviders((current) => ({ ...current, fallbackProvider: event.target.value as ProviderName | 'none' }))}>
                    <option value="none">No automatic fallback</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="groq">Groq Cloud</option>
                    <option value="custom">Custom OpenAI-compatible API</option>
                  </select>
                </label>
              </div>

              <div className="provider-grid">
                <section className={providers.activeProvider === 'gemini' ? 'provider-card active' : 'provider-card'}>
                  <header><Cloud size={15} /><span>Google Gemini</span><i>{providers.keyStatus.gemini}</i></header>
                  <label>API key<input type="password" value={keys.geminiKey} onChange={(event) => setKeys((current) => ({ ...current, geminiKey: event.target.value }))} placeholder={keyPlaceholder(providers.keyStatus.gemini, 'AIzaSy…')} autoComplete="off" /></label>
                  <label>Model<input value={providers.geminiModel} onChange={(event) => setProviders((current) => ({ ...current, geminiModel: event.target.value }))} placeholder="gemini-2.5-flash" /></label>
                </section>

                <section className={providers.activeProvider === 'groq' ? 'provider-card active' : 'provider-card'}>
                  <header><BrainCircuit size={15} /><span>Groq Cloud</span><i>{providers.keyStatus.groq}</i></header>
                  <label>API key<input type="password" value={keys.groqKey} onChange={(event) => setKeys((current) => ({ ...current, groqKey: event.target.value }))} placeholder={keyPlaceholder(providers.keyStatus.groq, 'gsk_…')} autoComplete="off" /></label>
                  <label>Model<input value={providers.groqModel} onChange={(event) => setProviders((current) => ({ ...current, groqModel: event.target.value }))} placeholder="llama-3.3-70b-versatile" /></label>
                </section>

                <section className={providers.activeProvider === 'custom' ? 'provider-card custom active' : 'provider-card custom'}>
                  <header><Terminal size={15} /><span>Custom AI</span><i>{providers.keyStatus.custom}</i></header>
                  <label className="wide">Base URL<input value={providers.customBaseUrl} onChange={(event) => setProviders((current) => ({ ...current, customBaseUrl: event.target.value }))} placeholder="https://api.example.com/v1 or http://localhost:11434/v1" /></label>
                  <label>API key<input type="password" value={keys.customApiKey} onChange={(event) => setKeys((current) => ({ ...current, customApiKey: event.target.value }))} placeholder={keyPlaceholder(providers.keyStatus.custom, 'Optional for localhost')} autoComplete="off" /></label>
                  <label>Model name<input value={providers.customModel} onChange={(event) => setProviders((current) => ({ ...current, customModel: event.target.value }))} placeholder="model-name" /></label>
                </section>

                <section className="provider-card auxiliary">
                  <header><Globe2 size={15} /><span>Auxiliary services</span><i>optional</i></header>
                  <label>Hugging Face token<input type="password" value={keys.huggingFaceKey} onChange={(event) => setKeys((current) => ({ ...current, huggingFaceKey: event.target.value }))} placeholder={keyPlaceholder(providers.keyStatus.huggingFace, 'hf_…')} autoComplete="off" /></label>
                  <label>Tavily search key<input type="password" value={keys.tavilyKey} onChange={(event) => setKeys((current) => ({ ...current, tavilyKey: event.target.value }))} placeholder={keyPlaceholder(providers.keyStatus.tavily, 'tvly-…')} autoComplete="off" /></label>
                </section>
              </div>

              <div className="provider-privacy-note"><Shield size={16} /><p><strong>Local encrypted vault.</strong> Secrets are encrypted with AES-256-GCM and never returned to the browser after saving. Protection: {providers.vaultProtection === 'environment-secret' ? 'ERA_VAULT_SECRET' : 'local 0600 key file'}. HTTP custom endpoints are accepted only on localhost.</p></div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="settings-group-list">
              <div className="settings-group">
                <div className="settings-group-title"><Volume2 size={16} /> Voice</div>
                <div className="setting-row clickable"><div><strong>Spoken replies</strong><span>Read ERA’s responses aloud</span></div><button type="button" role="switch" aria-checked={settings.autoSpeak} className={settings.autoSpeak ? 'toggle on' : 'toggle'} onClick={() => onChange({ ...settings, autoSpeak: !settings.autoSpeak })}><span /></button></div>
                <label className="setting-row select-row"><div><strong>Voice personality</strong><span>Gentle, slower, and higher-pitched</span></div><select value={settings.voiceStyle} onChange={(event) => onChange({ ...settings, voiceStyle: event.target.value as EraSettings['voiceStyle'] })}><option value="anime-soft">Soft anime heroine</option><option value="natural">Natural system voice</option></select></label>
                <label className="setting-row select-row"><div><strong>Assistant voice</strong><span>Choose an installed device voice</span></div><select value={settings.selectedVoice} onChange={(event) => onChange({ ...settings, selectedVoice: event.target.value })}><option value="">Auto-select best match</option>{voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}</select></label>
                <div className="setting-row language-setting-row"><div><strong>Speech language</strong><span>Search the complete ISO catalog; audio availability is device-dependent</span></div><LanguagePicker value={settings.language} voices={voices} onChange={(language) => onChange({ ...settings, language })} /></div>
                <div className="setting-row"><div><strong>Test this voice</strong><span>Preview the current voice personality</span></div><button type="button" className="voice-preview-button" onClick={previewVoice}><Play size={13} fill="currentColor" /> Preview</button></div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-group-list">
              <div className="settings-group">
                <div className="settings-group-title"><Shield size={16} /> Privacy & permissions</div>
                <label className="setting-row select-row"><div><strong>Privacy mode</strong><span>Controls when ERA may contact configured AI providers</span></div><select value={settings.privacyMode} onChange={(event) => onChange({ ...settings, privacyMode: event.target.value as EraSettings['privacyMode'] })}><option value="balanced">Balanced · block sensitive context</option><option value="cloud">Connected · provider access enabled</option><option value="offline">Offline · local commands only</option><option value="temporary">Temporary · no new memories</option></select></label>
                <label className="setting-row select-row"><div><strong>Proactivity budget</strong><span>How often ERA may offer unsolicited suggestions</span></div><select value={settings.proactivity} onChange={(event) => onChange({ ...settings, proactivity: event.target.value as EraSettings['proactivity'] })}><option value="silent">Silent</option><option value="important">Important alerts only</option><option value="balanced">Balanced suggestions</option></select></label>
                <div className="setting-row permission-status-row"><div><strong>Context firewall</strong><span>Detect credentials and sensitive data before external AI requests</span></div><span className="setting-status online">Active</span></div>
                <div className="setting-row permission-status-row"><div><strong>Image transmission</strong><span>Every vision upload requires a separate action preview</span></div><span className="setting-status online">Ask every time</span></div>
                <div className="setting-row"><div><strong>Persona memory</strong><span>Save only details you explicitly ask ERA to remember</span></div><button type="button" role="switch" aria-checked={settings.memoryEnabled} className={settings.memoryEnabled ? 'toggle on' : 'toggle'} onClick={() => onChange({ ...settings, memoryEnabled: !settings.memoryEnabled })}><span /></button></div>
                <div className="setting-row"><div><strong>Conversation history</strong><span>Clear the current browser session</span></div><button type="button" className="outline-button danger" onClick={onClearConversation}>Clear</button></div>
                <div className="setting-row emergency-lock-row"><div><strong>Emergency privacy lock</strong><span>Stop voice, block AI requests, close overlays, and pause memory immediately</span></div><button type="button" className="outline-button danger" onClick={onPrivacyLock}>Lock now</button></div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
