# ERA API Reference

Default origin: `http://localhost:8787`

All JSON responses disable caching. Request bodies have explicit size limits.

## Runtime

### `GET /api/health`

Returns runtime status, active provider, provider readiness, and Persona version.

## Provider settings

### `GET /api/settings/providers`

Returns non-secret provider settings and key-presence flags. Secret values are never returned.

### `PUT /api/settings/providers`

Validates and encrypts provider settings. Supports Gemini, Groq, and custom OpenAI-compatible endpoints.

Remote custom URLs require HTTPS. Plain HTTP is allowed only for localhost.

### `POST /api/settings/providers/test`

Runs a minimal request through the active provider and approved fallback.

## Conversation

### `POST /api/chat`

Request:

```json
{
  "messages": [
    { "role": "user", "text": "Create a roadmap" }
  ],
  "route": {
    "agents": ["planning", "voice"],
    "risk": "low",
    "language": "en-US"
  }
}
```

The server selects the active provider and may use the configured fallback.

## Vision

### `POST /api/vision`

Accepts one user-approved PNG, JPEG, or WebP data URL and a prompt. Gemini is currently required.

## Notes and memory

### `POST /remember`

Writes an explicit memory to a Markdown capture.

### `GET /api/notes`

Lists local Markdown captures with provenance and suggested related notes.

### `POST /api/notes`

Creates a manual Markdown note.

### `PUT /api/notes/:filename`

Updates an approved regular Markdown file.

### `DELETE /api/notes/:filename`

Deletes an approved regular Markdown file after the renderer’s confirmation flow.

### `GET /api/search?q=...`

Returns ranked local note matches, snippets, type, source, and timestamps.

## Languages

### `GET /api/languages?q=...&limit=...`

Searches the ISO 639-3 catalog. Returns speech tags and audio-support classification.

Catalog presence does not guarantee browser voice support.

## Error format

```json
{
  "error": "Human-readable error",
  "code": "OPTIONAL_MACHINE_CODE"
}
```

Clients must check HTTP status and must not infer success from missing errors.
