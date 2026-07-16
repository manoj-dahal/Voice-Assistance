# Threat Model

## Protected assets

- provider credentials;
- private notes and memories;
- user-selected files and images;
- local projects and reminders;
- desktop IPC capabilities;
- workflow approvals;
- release and signing credentials.

## Trust boundaries

- renderer to preload;
- preload to main process;
- main process to filesystem;
- local API to external AI provider;
- application to connector or MCP endpoint;
- local or future CI packaging environments to release-signing secrets.

## Primary threats

### Malicious renderer content

Mitigations: context isolation, sandboxing, disabled Node integration, navigation restrictions, and IPC allowlisting.

### Credential disclosure

Mitigations: encrypted vault, no secret-return API, context firewall, ignored environment files, and log restrictions.

### Path traversal and symlinks

Mitigations: basename checks, extension checks, regular-file validation, and symlink rejection for note operations.

### Prompt and tool injection

Mitigations: treat model and tool output as untrusted, keep policy outside prompts, require confirmation, and avoid autonomous external execution.

### Unbounded file processing

Mitigations: metadata-only large files, bounded extraction, bounded path samples, and no automatic binary upload.

### Supply-chain compromise

Mitigations: lockfile, Dependabot, local dependency audits, configuration tests, signed future plugins, and manifest validation.

### Release compromise

Mitigations: release-gating self-tests, platform signing, clean packaging environments, and secrets stored outside the repository.

## Residual risks

- local account compromise;
- malicious browser extensions;
- provider retention outside ERA’s control;
- user-approved harmful actions;
- imperfect secret detection;
- unsigned test artifacts.

Security claims must be reviewed when new connectors or native capabilities are added.
