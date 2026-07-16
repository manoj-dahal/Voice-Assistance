# ERA Security

## Security goals

ERA is designed around:

- least privilege;
- local-first storage;
- explicit confirmation;
- secret minimization;
- visible execution;
- honest capability boundaries.

## Provider vault

Provider keys are encrypted with AES-256-GCM.

Recommended configuration:

```dotenv
ERA_VAULT_SECRET=use-a-long-random-secret
```

Without this variable, ERA generates a local mode-`0600` key file. The local key protects against casual disclosure but does not replace full-disk encryption or operating-system account security.

Saved secrets are never returned through the settings API.

## Desktop isolation

Electron uses:

- context isolation;
- renderer sandboxing;
- disabled Node integration;
- an allowlisted preload bridge;
- restricted navigation;
- external HTTPS link delegation;
- trusted-origin permission checks.

## Context firewall

Balanced privacy mode detects sensitive-looking content before an external AI request. Protected patterns include credentials, private-key blocks, recovery phrases, payment-card data, and similar secrets.

The firewall is risk reduction, not a perfect data-loss-prevention system.

## File handling

- Dropped files are never executed.
- Large files remain metadata-only.
- Folder contents are represented by local manifests.
- Text extraction is bounded.
- Binary content is not invented or silently uploaded.
- Image transmission requires a separate preview and approval.

## Confirmation gates

High-impact actions must declare:

- purpose;
- execution steps;
- expected impact;
- risk;
- required permissions;
- whether rollback is possible.

## Reporting vulnerabilities

Do not include real secrets or personal data in public reports. Provide:

- affected version;
- reproduction steps using synthetic data;
- expected and actual behavior;
- impact;
- suggested mitigation when known.

## Security non-goals

ERA is not currently:

- a password manager;
- an endpoint detection system;
- a certified medical system;
- a financial transaction engine;
- a sandbox for arbitrary untrusted executable plugins.
