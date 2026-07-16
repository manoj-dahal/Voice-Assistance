# AI Providers

## Supported reasoning routes

ERA currently supports:

- Google Gemini;
- Groq Cloud;
- custom OpenAI-compatible APIs;
- keyless localhost OpenAI-compatible APIs.

Hugging Face and Tavily credentials can be stored for future adapters but are not active reasoning routes by themselves.

## Provider selection

Settings allows one primary provider and one fallback provider. Fallback occurs only when:

- the primary is unavailable or misconfigured;
- the fallback is configured;
- the fallback differs from the primary.

The response records which provider completed the request and whether fallback occurred.

## Gemini

Gemini supports ERA text reasoning, optional Google Search grounding, and the current image-analysis endpoint.

## Groq

Groq uses the OpenAI-compatible chat-completions format. Vision is not routed through Groq in the current implementation.

## Custom provider

Expected endpoint:

```text
<base-url>/chat/completions
```

If the configured URL already ends with `/chat/completions`, ERA uses it unchanged.

## Provider testing

Settings → AI Providers → Test sends a minimal request and reports provider and model. A successful network response does not guarantee quality for every task.

## Data minimization

Before provider transmission:

- only recent conversation messages are included;
- local deterministic commands are handled first;
- balanced privacy mode blocks sensitive-looking context;
- file context is bounded;
- binary files provide metadata only;
- selected response language is included as guidance.

## Failure behavior

ERA must report provider failures and retain local commands. It must not fabricate a provider response or claim that an unavailable tool ran.
