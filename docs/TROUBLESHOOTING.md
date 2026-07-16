# Troubleshooting

## Voice input unavailable

- Use Chrome or Edge.
- Confirm microphone permission.
- Verify the selected language is supported by the browser.
- Run the voice preview in Settings.
- Remember that catalog-only languages may have no speech engine.

## AI provider offline

- Open Settings → AI Providers.
- Confirm active provider, model, and key status.
- Save the vault.
- Run the provider test.
- Configure a fallback provider.
- For local models, verify the OpenAI-compatible base URL and server process.

## Provider vault cannot decrypt

The value of `ERA_VAULT_SECRET` must remain stable. If it changes, restore the original secret or intentionally reset the local vault after backing up non-secret settings.

## Notes do not appear

- Confirm `NOTES_DIR`.
- Check that the captures directory is readable.
- Use Memory → Markdown Bank → Refresh.
- Confirm files have a `.md` extension.
- Check API response from `GET /api/notes`.

## Folder drop does nothing

Directory-entry drag and drop works best in Chromium. Other browsers may expose files without directory hierarchy. Try dropping files directly or use a supported desktop/browser environment.

## Desktop app has no installed applications

The current IPC handler intentionally returns no applications until an operating-system discovery adapter is installed. Web application shortcuts remain available.

## Port 8787 is occupied

Set a different port:

```bash
PORT=8790 npm start
```

The Electron desktop entry currently expects the configured `PORT` before startup.

## Build failures after restructuring

```bash
rm -rf dist
npm install
npm run build
npm test
```

Use Node.js 22.12 or newer.

## Electron binary missing

Run a normal installation without `ELECTRON_SKIP_BINARY_DOWNLOAD`:

```bash
npm install
```

CI web builds intentionally skip the Electron binary. Desktop packaging jobs download it.
