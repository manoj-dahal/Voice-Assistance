# Desktop Packaging

## Configuration

Electron Builder uses `electron-builder.yml`.

Identity:

```text
appId: com.era.aera.manoj
productName: ERA AI
```

## Security defaults

- context isolation enabled;
- Node integration disabled;
- renderer sandbox enabled;
- navigation restricted to the local ERA origin;
- HTTPS external links delegated to the OS;
- preload IPC allowlist;
- camera and microphone permissions restricted to the trusted origin;
- user notes and provider vault stored under Electron user data.

## Commands

```bash
npm run desktop:preview
npm run package:unpacked
npm run package:win
npm run package:mac
npm run package:linux
```

## Targets

### Windows

- NSIS x64 installer
- configurable installation directory
- desktop and Start Menu shortcuts

### macOS

- DMG
- hardened runtime
- camera, microphone, network, JIT, and user-selected-file entitlements
- notarization disabled until credentials are configured

### Linux

- AppImage
- Snap in local builder configuration
- Debian package

CI packages AppImage and Debian artifacts by default to avoid requiring Snapcraft on every runner.

## Signing and publishing

Signing certificates, Apple notarization credentials, and GitHub tokens must be stored as CI secrets. Never commit them.

This branch does not include CI workflow files. Platform builds and draft releases must be run manually or configured after GitHub workflow permission is available.
