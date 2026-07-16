# ERA — powered by Persona Voice AI OS

![ERA Persona Voice AI OS](resources/public/brand/persona-os-banner.webp)

ERA is an original, voice-first AI assistant experience powered by the **Persona Voice AI OS v0.7** orchestration foundation. It combines natural voice interaction, specialist routing, transparent memory, research grounding, planning, multimodal screen intelligence, financial decision support, safe automation, permission gates, and audit logging.

> New to ERA? Start with the **[Table of Contents](docs/TABLE_OF_CONTENTS.md)**, **[Documentation Index](docs/README.md)**, and **[ERA Introduction](docs/ERA_INTRODUCTION.md)**.

## What is implemented

### Reference-matched desktop interface

- White rounded desktop window closely following the supplied AERA Agent dashboard composition
- Segmented top navigation for Dashboard, Macros, Apps, Gallery, Phone, and Settings
- Functional hamburger navigation drawer
- Animated 1,350-point voice sphere rendered on Canvas
- Left hologram, verified system information, workspace tree, and event panel
- Blue framed live transcript with text composer, sources, quick prompts, and file attachment icons
- Dashboard-wide drag and drop for folders, images, text, code, data, PDF, document, archive, audio, video, and unknown files
- No attachment-size or folder-total-size rejection: large files remain safe metadata-only attachments instead of being loaded into memory
- Recursive folder manifests with total file count, total size, and a bounded sample of local paths; folder contents are not uploaded automatically
- Local image previews for reasonably sized images, bounded text-context extraction, binary metadata boundaries, attachment removal, and transcript persistence for the active session
- Gallery and honest mobile-pairing placeholder views
- Responsive compact behavior for smaller screens

### Voice and conversation

- Browser speech recognition in Chrome and Edge
- A default **Soft Anime Heroine** voice profile with slower delivery, higher pitch, warm wording, and automatic selection of compatible installed voices
- Voice preview and explicit installed-voice selection in Settings
- Searchable ISO 639-3 catalog with 7,867 living, historical, constructed, macrolanguage, and individual-language entries
- BCP-47 speech-tag resolution, common regional defaults, installed-voice detection, and transparent Common / Browser-dependent / Catalog-only status
- Voice command language switching, such as “Switch language to Nepali”
- Selected-language guidance for Gemini, Groq, custom AI, and concurrent agent tasks
- Spoken responses using voices installed on the device
- Concise, caring, voice-first Persona behavior
- Text conversation fallback in modern browsers
- Interruption of active speech playback

### Persona orchestration

- Intent-based routing to Voice, Memory, Research, Knowledge, Planning, Automation, Screen, Security, Finance, and Collaboration roles
- Minimum-agent selection based on the request
- Risk classification for low-, medium-, and high-impact intents
- A consolidated Persona v0.7 production system instruction
- Server-side Gemini, Groq, or custom OpenAI-compatible reasoning with secrets excluded from the browser bundle

The current specialists are **logical orchestration roles** applied to one configured model request, not ten independent model processes. This keeps the foundation fast and understandable while leaving room for isolated agent workers later.

### Memory and knowledge graph

- Working-memory awareness through the current conversation
- Local long-term, semantic, and episodic memory layers
- Voice-to-Markdown capture: “Remember that…” writes a real note through `POST /remember` into `<NOTES_DIR>/captures/`
- Full Markdown Memory Bank with disk-backed list, create, GFM preview, edit, refresh, and confirmation-gated delete
- Ranked local full-text note search in the universal command palette
- Note provenance, modified timestamps, and automatically suggested backlinks
- Safe notes API with filename traversal protection, regular-file checks, size limits, and sensitive-secret rejection
- Sensible titles and timestamped filenames generated from the captured thought
- A LIVE knowledge graph with semantic relationship selection, node-birth animation, glow pulse, and camera flight
- Memory on/off control
- View, add, filter, and delete controls
- Existing v1 memories migrate automatically to the long-term layer

Saved memory is stored in browser `localStorage` and is not sent to cloud reasoning in this version.

### Persona OS Center

- Live specialist-agent registry and active routing state
- Interactive **Unified Intelligence Continuum** with Available, Adapter-ready, Research, and Speculative status filters
- Searchable **v2.0 Vision Registry** containing 152 aspirational systems, classified as Planned, Research, or Speculative—never falsely Complete
- Upgrade-intake audit for latency, reliability, language-count, context-size, quantum, and consciousness claims, with explicit evidence gates
- Searchable **Integration Ecosystem Registry** covering all 35 requested categories and a ≥1,165-adapter roadmap target
- Honest detected-connector counts, authorization models, approval boundaries, risk levels, first milestones, and JSON export
- JSON roadmap-manifest export and reality-grounded delivery-proposal launcher
- Honest capability inspector documenting current implementation, permission boundaries, and responsible next steps
- Explicit disclosure that ERA uses bounded context, logical specialist roles, classical compute, and does not claim consciousness
- Research workspace with optional Google Search grounding
- Local project planning and roadmap launch actions
- Permission-gated PNG, JPEG, and WebP visual analysis
- Financial research watchlist and risk-analysis prompts
- Transparent local action and orchestration audit log

### Providers and application library

- Settings vault for Gemini, Groq, Hugging Face, Tavily, and custom OpenAI-compatible APIs
- Custom base URL, API key, and model selection, including keyless localhost models such as Ollama-compatible servers
- AES-256-GCM encrypted server-side secret storage; saved keys are never returned to the browser
- Provider connection test, active-provider selection, and automatic configured fallback
- Desktop application discovery through an optional authenticated Electron bridge
- Honest browser fallback with allowlisted web applications

### Concurrent agent task runtime

- Run up to four bounded specialist tasks concurrently through the configured AI provider
- Research, Planning, Knowledge, Security, Finance, Automation, and Collaboration task roles
- Four-task mission templates with parallel Research and Security work, dependency-gated Planning, and final Knowledge synthesis
- Priority queue, pause/resume, cancellation, retries, result inspection, and local task recovery after reload
- Dependency results are injected only into downstream tasks after completion
- Balanced-mode context firewall and immediate cancellation when offline privacy mode activates
- Voice or text trigger: “Start a multi-agent mission for…”
- No autonomous external tool execution or hidden background agents

### ERA Skills engine

- Searchable built-in skill library with enable/disable controls that affect matching voice and text commands
- Permission manifests, risk levels, trigger phrases, execution plans, and confirmation requirements
- Custom no-code skill builder with simulation-only execution and permission selection
- Plugin and MCP manifest validator with namespaced IDs, HTTPS/localhost endpoint rules, permission allowlists, and high-impact confirmation enforcement
- Manifest registration and JSON export without executing external plugin code
- Built-in skills for voice, memory, search, timers, reminders, research, vision, apps, planning, calculation, provider routing, privacy lock, and workflow previews
- 249 additional roadmap skills: 152 Vision Registry systems, 35 Integration Ecosystem connectors, and all 62 advanced feature suggestions
- Every roadmap skill is clearly marked Planned, Research, or Speculative and is never presented as installed

### Search, privacy, reminders, and safe automation

- Universal command palette on `Ctrl + Shift + E` across navigation, commands, Markdown notes, memories, and projects
- Balanced, connected, offline, and temporary privacy modes
- Context firewall that blocks sensitive-looking prompts before external AI transmission
- Emergency session privacy lock that stops voice, blocks AI requests, closes overlays, and pauses memory
- Durable local reminders with relative and recurring voice commands, browser notifications, spoken delivery, and a reminder dock
- Local timers, calculations, explicit memories, and daily briefs
- Safe allowlisted links for GitHub, YouTube, Spotify, Gmail, Calendar, Maps, and Notion
- Action previews showing purpose, execution plan, impact, and risk
- Confirmation gates before image uploads and destructive local actions
- Persistent automation and reminder preferences
- No autonomous financial trades, fund transfers, external messages, or destructive system operations

## Example requests

- “Research the latest voice-first AI interfaces.”
- “Create a roadmap for my product launch.”
- “Remember that accessibility is a project requirement.”
- “Start a 25 minute timer.”
- “Remind me in 30 minutes to review the provider settings.”
- “Remind me every week to back up ERA.”
- “Analyze this screenshot for visible errors.”
- “Build a portfolio concentration-risk checklist.”
- “Calculate (12 + 8) / 4.”
- “Open GitHub.”

## Quick start

Requirements: Node.js 22.12 or newer (required by the desktop Electron toolchain).

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The web interface and API server start together. Local routing and deterministic commands work without an API key.

## Connect an AI provider

Open **Settings → AI Providers** to configure Gemini, Groq, or a custom OpenAI-compatible API. Custom providers accept:

- Base URL, such as `https://api.example.com/v1`
- API key
- Model name

For local models, HTTP is allowed only on `localhost`, for example `http://localhost:11434/v1`. Remote custom endpoints must use HTTPS. Saved secrets are encrypted in `.era/providers.vault` and are never returned to the browser.

Environment variables remain available for deployments:

```bash
cp .env.example .env
```

```dotenv
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=
ERA_VAULT_SECRET=use_a_long_random_secret
NOTES_DIR=./resources/notes
```

`ERA_VAULT_SECRET` is recommended. When it is absent, ERA generates a local 32-byte key protected with mode `0600`. Provider secrets never enter the Vite browser bundle.

`NOTES_DIR` can point to an existing notes vault. Relative paths resolve from the repository root. A capture such as “Remember that product accessibility is essential” becomes a timestamped Markdown file under `captures/`, with YAML frontmatter and a generated title. Credentials, private keys, recovery phrases, and payment-card secrets are rejected before writing.

When the Research Agent is selected, the server enables Gemini Google Search grounding and returns available grounding sources to the interface. The Screen Agent uses the same configured model for explicitly approved image analysis.

## Production

```bash
npm run build
npm start
```

The production interface and API are served from [http://localhost:8787](http://localhost:8787), or the port specified through `PORT`.

## Desktop packaging

ERA includes an Electron main entry, context-isolated preload bridge, hardened builder configuration, platform icons, and macOS entitlements.

```bash
npm run desktop:preview
npm run package:unpacked
npm run package:win
npm run package:mac
npm run package:linux
```

Platform packaging requires the Electron binary and the operating-system build tools for the selected target. GitHub publishing uses the normal electron-builder environment configuration; credentials are never stored in this repository.

## Tests

```bash
npm test
npm run build
npm audit
```

The test suite covers deterministic commands, safe URL behavior, arithmetic, orchestration routing, finance/security collaboration, confirmation risk classification, desktop contracts, and packaging configuration.

Dependabot checks npm and GitHub Actions updates weekly using the Asia/Kathmandu timezone. CI workflow files are intentionally excluded from this branch because the connected GitHub App cannot push workflow changes.

## Architecture

```text
Voice / text / approved image
            ↓
      ERA React interface
            ↓
 Local command + risk classifier
       ↙                 ↘
Safe local action      Persona orchestrator
(timer/memory/URL)            ↓
                      Specialist role selection
                  research / planning / security /
                  finance / screen / knowledge ...
                              ↓
                Server-side Gemini + search grounding
                              ↓
              Unified response + sources + speech

Local context plane:
working memory · persistent memory layers · projects
knowledge graph · preferences · permission log · audit log
```

### API routes

- `GET /api/health` — runtime and active-provider status
- `GET /api/languages?q=…` — search the complete ISO 639-3 language catalog with speech support metadata
- `GET /api/settings/providers` — non-secret provider configuration and key-presence status
- `PUT /api/settings/providers` — validate and encrypt provider configuration
- `POST /api/settings/providers/test` — test the active reasoning provider
- `GET /api/search?q=…` — ranked local Markdown search with snippets and provenance
- `GET /api/notes` and `POST /api/notes` — list or create Markdown notes
- `PUT /api/notes/:filename` and `DELETE /api/notes/:filename` — update or delete an approved capture
- `POST /remember` — durable voice/text capture to a Markdown note
- `POST /api/chat` — Persona-routed reasoning through the active provider
- `POST /api/vision` — permission-gated image analysis

## Security model

- API keys remain server-side and are encrypted at rest with AES-256-GCM.
- Custom remote providers require HTTPS; plain HTTP is restricted to localhost.
- Saved secret values are never returned through settings APIs.
- Chat and image bodies have explicit size limits.
- Images are validated as PNG, JPEG, or WebP.
- External URL commands use an allowlist.
- Destructive local actions require an impact preview and confirmation.
- Financial features provide education and decision support only.
- The interface never claims an external action succeeded without a verified tool result.
- Passwords, tokens, banking credentials, and private keys should never be stored as memory.

## Browser support

Text interaction works in modern browsers. ERA can catalog and pass any valid ISO 639-3 language identifier to compatible AI systems, but catalog coverage is not the same as audio-engine coverage. Speech recognition works best in Chromium-based browsers, and speech output depends on operating-system voices. The language picker reports whether a language commonly works in browsers, depends on the current browser, or is catalog-only. The Soft Anime Heroine profile adjusts pitch, pace, volume, wording, and automatic voice selection only when a compatible installed voice exists.

## Desktop roadmap

This release includes the Electron packaging and security foundation. Future desktop adapters can add:

- local wake-word detection and voice activity detection
- full-duplex Gemini Live audio with interruption handling
- an optional neural character-voice provider for a consistent anime-style voice across operating systems
- global shortcuts, system tray, and compact overlay
- permission-scoped installed-app discovery and launching
- MCP discovery and isolated tool workers
- calendar, mail, weather, CRM, and smart-home connectors
- encrypted vector memory and opt-in account synchronization
- PDF/document extraction and screen-region capture
- independently deployable specialist agents with shared tracing

System-level tools should use least privilege, explicit capabilities, confirmation gates, and verifiable execution results.
