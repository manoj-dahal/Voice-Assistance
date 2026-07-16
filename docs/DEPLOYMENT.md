# Deployment

## Web and local API

Build and run:

```bash
npm run build
npm start
```

Default origin:

```text
http://localhost:8787
```

ERA is designed as a local application. Exposing the API directly to an untrusted network is not recommended because it currently assumes a trusted local user.

## Reverse proxy

If deployed behind a reverse proxy:

- use HTTPS;
- restrict network access;
- preserve request-size limits;
- configure origin controls;
- protect provider-setting endpoints;
- do not expose the provider vault directory;
- use a stable `ERA_VAULT_SECRET`.

## Environment

Set provider keys through environment variables or the local encrypted settings interface. Keep notes and vault data on persistent encrypted storage.

## Desktop

Use Electron Builder commands documented in [Desktop Packaging](DESKTOP_PACKAGING.md).

## Upgrade process

1. Back up notes and encrypted vault material.
2. Install dependencies.
3. Run tests and build.
4. Review configuration changes.
5. Start ERA and check `/api/health`.
6. Test the active provider.
7. Verify notes and memory views.

## Rollback

Keep the previous application artifact and data backup. Application rollback does not automatically reverse data migrations; migration scripts must document backward compatibility.
