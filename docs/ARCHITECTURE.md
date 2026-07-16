# ERA Architecture

## Overview

ERA uses a local-first desktop-ready architecture with three source boundaries:

```text
Main process / local API
          │
          ▼
Context-isolated preload bridge
          │
          ▼
React renderer
```

The web edition runs the same renderer and local API without Electron.

## Main process

Location: `src/main/`

Responsibilities:

- start and serve the local HTTP runtime;
- route configured AI providers;
- encrypt provider credentials;
- provide Markdown note and search APIs;
- expose the ISO language catalog;
- validate vision requests;
- serve the production renderer;
- host the Electron BrowserWindow when running the desktop edition.

`index.mjs` is the plain Node entry. `electron.mjs` is the desktop entry. TypeScript files under `src/main/` define desktop contracts and guards.

## Preload bridge

Location: `src/preload/`

The Electron renderer has:

- context isolation enabled;
- Node integration disabled;
- sandboxing enabled;
- an allowlisted IPC bridge only.

Allowed channels are defined in `src/main/lib/system.ts`. Unknown channels are rejected before IPC invocation.

## Renderer

Location: `src/renderer/`

The renderer contains:

- dashboard and navigation;
- speech recognition and synthesis;
- agent-task and skill interfaces;
- notes, memory, knowledge graph, and reminders;
- provider, language, privacy, and permission settings;
- drag-and-drop file and folder manifests.

The renderer does not receive direct filesystem or unrestricted Node access.

## Request flow

```text
Voice or text
    │
    ▼
Local deterministic command parser
    │
    ├── Local action: timer, reminder, note, app URL
    │
    └── Open-ended request
             │
             ▼
       Privacy/context firewall
             │
             ▼
       Intent and agent routing
             │
             ▼
     Active AI provider + fallback
             │
             ▼
       Unified ERA response
```

## Storage

| Data | Storage |
| --- | --- |
| Provider secrets | AES-256-GCM vault under `.era/` or desktop user data |
| Markdown notes | `resources/notes/captures/` or configured `NOTES_DIR` |
| UI preferences | Browser local storage |
| Projects and reminders | Browser local storage |
| Agent tasks | Browser local storage |
| Build artifacts | `dist/` and `release/` |

## Trust boundaries

1. User input is untrusted.
2. Dropped files are never executed.
3. Binary attachments provide metadata only unless a dedicated approved parser exists.
4. Provider keys are never returned to the renderer.
5. External actions require an allowlist or explicit permission path.
6. Roadmap skills cannot execute tools.
