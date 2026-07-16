# Configuration

## Environment file

Create a local file:

```bash
cp .env.example .env
```

Never commit `.env`.

## Runtime variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Local API and production server port | `8787` |
| `NOTES_DIR` | Markdown notes directory | `./resources/notes` |
| `ERA_DATA_DIR` | Encrypted runtime-data directory | `.era` |
| `ERA_VAULT_SECRET` | External secret used to derive the vault key | Local generated key |
| `GEMINI_API_KEY` | Gemini provider key | Empty |
| `GEMINI_MODEL` | Gemini model | `gemini-2.5-flash` |
| `GROQ_API_KEY` | Groq provider key | Empty |
| `HUGGINGFACE_API_KEY` | Hugging Face token | Empty |
| `TAVILY_API_KEY` | Tavily search key | Empty |

Environment keys take precedence over encrypted values stored through Settings.

## Renderer settings

Browser-local settings include:

- voice profile;
- speech language;
- selected installed voice;
- memory state;
- privacy mode;
- proactivity budget;
- reminders;
- projects;
- enabled skills;
- custom skill simulations.

## Custom AI endpoint

Remote endpoints require HTTPS. Plain HTTP is accepted only for localhost.

```text
Base URL: http://localhost:11434/v1
Model: qwen2.5
API key: optional for localhost
```

## Desktop configuration

Electron overrides notes and vault storage with the operating system user-data directory unless explicit environment variables are provided.

## Configuration precedence

```text
Explicit environment variable
        ↓
Encrypted provider vault
        ↓
Application default
```
