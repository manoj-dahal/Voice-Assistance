# ERA Development Guide

## Requirements

- Node.js 22.12 or newer
- npm
- Chrome or Edge for the best browser speech-recognition support

Native packaging also requires operating-system-specific Electron build tools.

## Install

```bash
npm install
```

## Development mode

```bash
npm run dev
```

This starts:

- the local API on `http://localhost:8787`;
- Vite on `http://localhost:5173`;
- a Vite proxy for `/api` and `/remember`.

## Build and run

```bash
npm run build
npm start
```

The production application is served from `http://localhost:8787`.

## Validation

```bash
npm test
npm run build
npm audit
```

Or run all checks:

```bash
npm run verify
```

Print the tracked project structure:

```bash
npm run structure
```

## Source workflow

- Keep renderer code under `src/renderer/src/`.
- Keep trusted Node code under `src/main/`.
- Keep bridge contracts under `src/preload/`.
- Keep unit tests beside modules under `src/renderer/src/lib/`.
- Keep integration tests under `testing/`.
- Keep runtime resources under `resources/`.

## Adding a local command

1. Extend `AssistantAction` in `src/renderer/src/lib/assistant.ts`.
2. Add deterministic parsing in `runLocalCommand`.
3. Execute the action in `src/renderer/src/App.tsx`.
4. Add tests in `assistant.test.ts`.
5. Add or update the controlling skill in `skills.ts`.
6. Document permissions and confirmation behavior.

## Adding a view

1. Create a screen under `src/renderer/src/views/`.
2. Add its workspace tab type.
3. Add navigation through the Titlebar, Sidebar, or command palette.
4. Preserve keyboard and reduced-motion accessibility.
5. Add responsive styles in `UI/main.css`.

## Environment variables

Copy `.env.example` to `.env`. Never commit provider credentials, signing identities, or publishing tokens.
