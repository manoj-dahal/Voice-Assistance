# ERA Project Structure

ERA follows a desktop-ready architecture with distinct main-process, preload, renderer, resource, documentation, script, and testing boundaries.

```text
Voice-Assistance/
├── .github/
│   └── dependabot.yml
│
├── assets/
│   └── design/
│       ├── aera-dashboard-layout.svg
│       └── era-ui-dashboard.png
│
├── bin/
│   └── era-ai.mjs
│
├── docs/
│   ├── ACCESSIBILITY.md
│   ├── AGENTS_AND_MULTITASKING.md
│   ├── AI_PROVIDERS.md
│   ├── API_REFERENCE.md
│   ├── ARCHITECTURE.md
│   ├── AUTOMATION_AND_REMINDERS.md
│   ├── BACKUP_AND_RECOVERY.md
│   ├── CONFIGURATION.md
│   ├── CONNECTOR_DEVELOPMENT.md
│   ├── CONTRIBUTING.md
│   ├── DATA_AND_STORAGE.md
│   ├── DEPLOYMENT.md
│   ├── DESIGN_SYSTEM.md
│   ├── DESKTOP_PACKAGING.md
│   ├── DEVELOPMENT.md
│   ├── ERA_INTRODUCTION.md
│   ├── FAQ.md
│   ├── FILES_AND_FOLDERS.md
│   ├── MCP_INTEGRATION.md
│   ├── MEMORY_AND_NOTES.md
│   ├── OBSERVABILITY.md
│   ├── PERFORMANCE.md
│   ├── PRIVACY_AND_PERMISSIONS.md
│   ├── PROJECT_STRUCTURE.md
│   ├── README.md
│   ├── RELEASE_PROCESS.md
│   ├── ROADMAP.md
│   ├── SECURITY.md
│   ├── SKILLS_AND_PLUGINS.md
│   ├── TABLE_OF_CONTENTS.md
│   ├── TESTING_STRATEGY.md
│   ├── THREAT_MODEL.md
│   ├── TROUBLESHOOTING.md
│   └── VOICE_AND_LANGUAGES.md
│
├── resources/
│   ├── build/
│   │   ├── entitlements.mac.plist
│   │   └── icon.png
│   ├── notes/
│   │   └── captures/
│   │       └── .gitkeep
│   └── public/
│       └── brand/
│           ├── era-favicon.png
│           ├── era-vision-core.webp
│           └── persona-os-banner.webp
│
├── scripts/
│   ├── print-structure.mjs
│   └── verify.mjs
│
├── src/
│   ├── main/
│   │   ├── lib/
│   │   │   ├── index.ts
│   │   │   ├── persona-system.mjs
│   │   │   ├── provider-vault.mjs
│   │   │   └── system.ts
│   │   ├── electron.mjs
│   │   ├── index.mjs
│   │   └── index.ts
│   │
│   ├── preload/
│   │   ├── index.cjs
│   │   ├── index.d.ts
│   │   └── index.ts
│   │
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── UI/
│           │   └── main.css
│           ├── assets/
│           ├── components/
│           │   ├── UI/
│           │   │   └── AICoreSphere.tsx
│           │   ├── Titlebar.tsx
│           │   └── ...
│           ├── hooks/
│           ├── lib/
│           ├── public/
│           │   └── Logo.png
│           ├── services/
│           │   └── system-info.ts
│           ├── views/
│           │   ├── APP.tsx
│           │   ├── Dashboard.tsx
│           │   ├── Gallery.tsx
│           │   ├── Notes.tsx
│           │   ├── Phone.tsx
│           │   └── Settings.tsx
│           ├── App.tsx
│           ├── eraRoot.tsx
│           ├── env.d.ts
│           └── main.tsx
│
├── testing/
│   ├── desktop-contract.test.mjs
│   ├── documentation.test.mjs
│   ├── electron-builder.test.mjs
│   ├── languages.test.mjs
│   └── provider-vault.test.mjs
│
├── .env.example
├── .gitignore
├── electron-builder.yml
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Process boundaries

### `src/main/`

Trusted Node-side runtime:

- local HTTP and production server;
- encrypted AI-provider vault;
- Markdown notes and search APIs;
- language catalog;
- provider routing and vision;
- typed desktop-channel guards.

`electron.mjs` creates the hardened desktop window and starts the local runtime. `index.mjs` remains independently executable so the web/API edition can run without Electron. `index.ts` exposes the typed desktop-main surface.

### `src/preload/`

Minimal context-isolated desktop bridge. `index.cjs` is the runtime preload used by Electron; the TypeScript files define and validate the same allowlisted channel contract. The renderer never receives unrestricted Node access.

### `src/renderer/`

Browser-safe React application:

- `UI/` — global visual system;
- `components/` — reusable interface components;
- `components/UI/` — visual core components;
- `hooks/` — browser hooks;
- `lib/` — renderer domain logic and colocated unit tests;
- `services/` — typed browser/desktop service adapters;
- `views/` — full application screens;
- `public/` — renderer source references that are not Vite's deployment public directory.

### `resources/`

Runtime resources outside source code:

- `resources/public/` is configured as Vite's public directory;
- `resources/notes/` is the default local Markdown vault.

### `assets/`

Design references and documentation artwork. They are not automatically shipped to the renderer.

### `bin/`

Stable executable entrypoint used by package scripts and future installers.

### `scripts/`

Repository maintenance:

```bash
npm run structure
npm run verify
```

### `testing/`

Integration-oriented tests. Unit tests remain colocated with renderer logic in `src/renderer/src/lib/`.

## Runtime-only paths

```text
.era/
├── providers.vault
└── vault.key

resources/notes/captures/
└── *.md

dist/
node_modules/
```
