# Data and Storage

## Storage map

| Data | Location | Protection |
| --- | --- | --- |
| AI provider secrets | `.era/providers.vault` or Electron user data | AES-256-GCM |
| Vault key | `.era/vault.key` | Mode `0600` |
| Markdown notes | Configured `NOTES_DIR/captures` | Local filesystem permissions |
| UI settings | Browser local storage | Browser profile security |
| Projects | Browser local storage | Browser profile security |
| Reminders | Browser local storage | Browser profile security |
| Agent tasks | Browser local storage | Browser profile security |
| Skill state | Browser local storage | Browser profile security |
| Temporary image previews | Object URLs | Active renderer session |

## Markdown format

```markdown
---
title: "Example memory"
created: "2026-07-16T00:00:00.000Z"
source: ERA voice capture
type: memory
---

# Example memory

Content...
```

## Retention

ERA does not currently implement automatic retention schedules. Users can delete notes, memory records, tasks, reminders, and audit history through their respective interfaces.

## File attachments

Large files and folders remain metadata-only. Local text extraction and provider context are bounded even when attachment metadata has no size rejection.

## Backups

Back up Markdown notes and the encrypted provider vault separately. A vault backup is unusable without the corresponding key or `ERA_VAULT_SECRET`.

## Deletion limitations

Filesystem deletion and browser-local deletion do not guarantee secure physical-media erasure. Use operating-system encryption and secure-storage policies for sensitive environments.
