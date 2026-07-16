# Testing Strategy

## Test organization

- Unit tests are colocated under `src/renderer/src/lib/`.
- Integration and configuration tests are under `testing/`.
- CI workflow files are intentionally excluded from this branch; run `npm run verify` before every push or pull request.

## Current coverage areas

- local command parsing;
- arithmetic safety;
- reminders and privacy lock;
- orchestration routing;
- multi-agent dependencies;
- skill and manifest validation;
- provider-vault URL and secret handling;
- language catalog integrity;
- file classification and folder entries;
- capability and roadmap registries;
- Electron Builder configuration;
- documentation structure and links.

## Commands

```bash
npm test
npm run test:watch
npm run build
npm audit
npm run verify
```

## Required tests for new tools

- valid input;
- invalid input;
- missing permission;
- cancellation;
- timeout;
- provider failure;
- secret redaction;
- audit result;
- confirmation gate;
- safe retry;
- rollback when supported.

## Manual checks

Voice, microphone permission, installed TTS voices, drag-and-drop folders, and native packages require environment-specific manual checks.

## Native package checks

Desktop CI builds unsigned packages. Signed release validation must additionally verify certificate identity, notarization, installer behavior, uninstall behavior, and clean user-data migration.
