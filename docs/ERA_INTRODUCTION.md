# ERA Voice Agent

## Introduction

**ERA is a privacy-focused, voice-first personal AI operating environment.** It combines natural conversation, local commands, persistent Markdown memory, concurrent specialist tasks, safe automation, screen intelligence, application launching, multilingual configuration, and configurable AI providers in one desktop-inspired interface.

ERA is designed to help a user:

- think and research clearly;
- organize notes, memories, goals, and projects;
- run timers, reminders, and approved workflows;
- coordinate several bounded AI tasks at once;
- inspect permissions before consequential actions;
- choose between cloud, custom, and local AI providers;
- retain control over data, credentials, and external actions.

ERA does not claim consciousness, unlimited context, quantum computation, autonomous authority, or integrations that have not been implemented and verified.

---

## Product identity

| Item | Value |
| --- | --- |
| Product | ERA Voice Agent |
| Application version | `0.1.0` |
| Persona runtime | Persona Voice AI OS `v0.7` |
| Primary interface | React and TypeScript |
| Local API | Node.js HTTP server |
| Default storage | Browser local storage and Markdown files |
| Provider support | Gemini, Groq, and custom OpenAI-compatible APIs |
| Desktop integration | Optional Electron bridge foundation |

### Personality

ERA should feel intelligent, calm, fast, friendly, caring, professional in competence, and easy to understand. Its default speech profile is a softer, slower, higher-pitched companion voice when the operating system provides a compatible voice.

The personality affects delivery—not factual standards. ERA must still communicate uncertainty, identify limitations, and avoid claiming that an action succeeded without a verified result.

---

## What ERA can do now

### Voice and conversation

ERA supports:

- browser speech recognition;
- interim and final transcripts;
- speech synthesis with automatic installed-voice selection;
- adjustable voice personality and language;
- speech interruption;
- typed conversation when voice is unavailable;
- short, voice-friendly responses;
- provider-generated responses in the selected language.

Speech recognition works best in Chromium-based browsers. Exact recognition and synthesis coverage depends on the browser, operating system, and installed voice packages.

### Multilingual catalog

ERA exposes a searchable ISO 639-3 registry containing **7,867 language records**. The registry includes living, historical, extinct, constructed, macrolanguage, and individual-language entries.

Each language is classified as:

- **Common browser support** — commonly recognized by browser speech engines;
- **Browser dependent** — valid language metadata, but availability varies;
- **Catalog only** — recognized by the catalog and AI layer, but no browser audio support is promised.

Example voice command:

> “Switch language to Nepali.”

Selecting a catalog language does not create a voice that is absent from the user’s device.

### Local command engine

Deterministic commands run before connected AI reasoning. Examples include:

- “What time is it?”
- “Calculate `(12 + 8) / 4`.”
- “Start a 25 minute timer.”
- “Remind me in 30 minutes to review the roadmap.”
- “Remind me every week to back up ERA.”
- “Open GitHub.”
- “Search the web for voice-first interfaces.”
- “Activate privacy lock.”

Arithmetic is parsed locally without `eval`.

### Persistent memory

A request beginning with **“Remember that…”** is written to a real Markdown file under:

```text
<NOTES_DIR>/captures/
```

ERA:

1. rejects credential-like secrets;
2. creates a title from the first meaningful words;
3. writes YAML frontmatter and Markdown content;
4. adds the memory to browser state;
5. finds a related graph node;
6. animates the new node into the LIVE knowledge graph;
7. confirms the capture aloud.

The Markdown Memory Bank supports listing, creating, editing, previewing, refreshing, and confirmation-gated deletion.

### Universal local search

Press:

```text
Ctrl + Shift + E
```

The command palette searches:

- navigation commands;
- built-in commands;
- Markdown notes;
- explicit memories;
- projects;
- application views;
- settings.

Disk-backed note search returns ranked snippets and provenance.

### Concurrent agent tasks

ERA can run up to four bounded specialist tasks concurrently. Available logical roles include:

- Research;
- Planning;
- Knowledge;
- Security;
- Finance;
- Automation;
- Collaboration.

Example:

> “Start a multi-agent mission for planning the next ERA release.”

A mission creates a dependency graph:

```text
Research ──┐
           ├──> Planning ──> Knowledge synthesis
Security ──┘
```

Research and Security may run in parallel. Planning waits for both. Synthesis waits for Planning. Users can pause the queue, change concurrency, cancel tasks, retry failures, and inspect every prompt and result.

These are visible, bounded model requests—not hidden autonomous processes.

### Skills engine

The Skills workspace contains:

- functional built-in skills;
- custom simulation-only skills;
- validated plugin manifests;
- validated MCP manifests;
- non-operational roadmap skills.

Every skill can declare:

- trigger phrases;
- required permissions;
- risk level;
- execution steps;
- confirmation requirements;
- implementation status.

Disabling a built-in skill blocks matching voice and text commands.

Custom skills begin in simulation mode. Registering a plugin or MCP manifest validates metadata only; it does not execute external code.

### AI provider vault

Settings supports:

- Google Gemini API key and model;
- Groq API key and model;
- Hugging Face token storage;
- Tavily key storage;
- custom OpenAI-compatible base URL, API key, and model;
- primary and fallback provider selection;
- provider connection testing.

Secrets are encrypted using AES-256-GCM. Saved key values are never returned to the browser.

For local models, ERA accepts localhost HTTP endpoints such as:

```text
http://localhost:11434/v1
```

Remote custom endpoints must use HTTPS.

### Screen and image intelligence

The Screen module accepts user-selected PNG, JPEG, or WebP images. Before transmission, ERA displays:

- the purpose;
- planned processing steps;
- expected impact;
- risk level;
- the fact that the image will leave the browser.

Gemini is currently required for image analysis. ERA analyzes only the file selected by the user; it does not infer hidden windows or unseen content.

### Applications

In browser mode, ERA provides approved web-service shortcuts. Installed desktop application discovery is unavailable in a normal browser.

When an authenticated Electron bridge is present, the Apps workspace can request an installed-app list and invoke the desktop app launcher.

### Projects, automation, and reminders

ERA includes:

- local projects and project status;
- roadmap generation prompts;
- automation templates;
- execution previews;
- local focus timers;
- durable one-time reminders;
- recurring daily and weekly reminders;
- browser and spoken notifications;
- reminder recovery after page reload.

---

## Interface overview

### Dashboard

The primary dashboard contains:

- hologram visualization;
- verified runtime information;
- workspace project tree;
- latest audited event;
- animated particle voice core;
- live transcript panel;
- text composer;
- dashboard-wide drag-and-drop files and recursive folder manifests;
- no attachment-size rejection, with large files safely retained as metadata-only entries;
- folder file counts, total sizes, and bounded path samples without automatic folder upload;
- file-type icons and local image previews in the transcript;
- bounded local text extraction and binary-file metadata labels;
- quick prompts;
- voice activation control.

### Main navigation

| View | Purpose |
| --- | --- |
| Dashboard | Voice and text conversation |
| Macros | Automations and reminders |
| Apps | Desktop bridge and web applications |
| Skills | Built-in, custom, plugin, MCP, and roadmap skills |
| Agents | Concurrent specialist task queue |
| Gallery | ERA visual assets |
| Phone | Honest mobile-bridge placeholder |
| OS Center | Agents, continuum, research, planning, vision, finance, and registries |
| Memory | Markdown bank and memory layers |
| Settings | Providers, voice, languages, privacy, and permissions |

---

## Architecture

```text
Voice / Text / Approved Image
             │
             ▼
       ERA React Interface
             │
       ┌─────┴──────────┐
       │                │
       ▼                ▼
Local Command      Intent Router
and Safety Layer        │
       │                ▼
       │        Specialist Role Selection
       │                │
       │                ▼
       │      Configured AI Provider Route
       │       Gemini / Groq / Custom API
       │                │
       └───────┬────────┘
               ▼
     Unified Response and Speech

Local context plane:
Markdown notes · memory layers · projects · reminders
knowledge graph · skills · audit log · provider preferences
```

### Frontend

- React 18
- TypeScript
- Vite
- Lucide icons
- Canvas particle rendering
- React Markdown with GFM support
- Browser Web Speech APIs

### Backend

- Node.js HTTP server
- Static production serving
- Provider routing and fallback
- AES-256-GCM provider vault
- Markdown note CRUD
- Ranked local search
- ISO language registry
- Gemini vision adapter

---

## Safety and privacy

### Privacy modes

ERA provides:

- **Balanced** — blocks sensitive-looking context before provider requests;
- **Connected** — allows configured provider access;
- **Offline** — local deterministic commands only;
- **Temporary** — prevents new persistent memories.

### Emergency privacy lock

The privacy lock:

- stops active speech;
- stops listening;
- closes command overlays;
- blocks connected AI requests;
- switches to offline mode;
- pauses new memories.

Unlocking the local session does not automatically restore cloud or memory permissions.

### Confirmation gates

ERA requires or supports confirmation before:

- image transmission;
- destructive memory operations;
- project deletion;
- audit-log deletion;
- workflow execution;
- future high-impact connector actions.

### Protected information

ERA rejects credential-like content from persistent notes, including:

- passwords and passcodes;
- API and secret keys;
- access and refresh tokens;
- private-key blocks;
- recovery and seed phrases;
- payment-card numbers.

This filtering reduces risk but is not a substitute for a dedicated password manager.

---

## Status language

ERA uses explicit implementation labels:

| Label | Meaning |
| --- | --- |
| Available | Implemented and verifiable in this repository |
| Adapter-ready | Architecture exists, external connector is not installed |
| Planned | Practical roadmap target |
| Research | Requires substantial validation, hardware, regulation, or specialized data |
| Speculative | Concept only; no deployable implementation is claimed |
| Simulation | Safe preview with no external execution |

Roadmap counts must never be presented as connected integrations.

---

## Quick start

### Requirements

- Node.js 22.12 or newer
- npm
- Chrome or Edge recommended for speech recognition

### Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

### Production

```bash
npm run build
npm start
```

Open:

```text
http://localhost:8787
```

### Optional environment configuration

```bash
cp .env.example .env
```

Important variables:

```dotenv
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=
ERA_VAULT_SECRET=
ERA_DATA_DIR=.era
NOTES_DIR=./resources/notes
PORT=8787
```

`ERA_VAULT_SECRET` is recommended. If absent, ERA creates a local mode-`0600` encryption key.

---

## First commands to try

```text
What can you do?
Start a 10 second timer.
Remind me in 5 minutes to test ERA.
Remember that privacy reviews are required for new tools.
What do you remember?
Switch language to Nepali.
Create a roadmap for the desktop bridge.
Start a multi-agent mission for reviewing the skills architecture.
Activate privacy lock.
```

---

## Current limitations

- ERA includes an Electron packaging foundation, but installed-app discovery and other operating-system adapters are still bounded placeholders.
- Browser and Electron speech support remain far smaller than the full ISO language catalog.
- The phone bridge is a roadmap placeholder.
- Most ecosystem connectors are not installed.
- Custom and roadmap skills do not execute tools.
- Agent tasks call configured language models but do not autonomously control external systems.
- Screen intelligence analyzes selected images, not continuous desktop video.
- Memory search is local ranked text search, not yet an embedding database.
- Financial features provide educational analysis only.
- Health features do not diagnose or replace professional care.

---

## Trust contract

ERA should always:

1. distinguish implemented capabilities from roadmap concepts;
2. protect credentials and sensitive data;
3. show permission boundaries;
4. request confirmation before consequential actions;
5. report failures instead of hiding them;
6. avoid claiming consciousness or independent authority;
7. keep the user in control of memory, providers, tools, and execution.
