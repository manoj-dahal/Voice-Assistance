# Frequently Asked Questions

## Is ERA a chatbot?

ERA is designed as a voice-first assistant environment with local commands, memory, skills, agents, automation, and provider routing. Open-ended reasoning still uses configured language models.

## Does ERA work without an API key?

Yes. Local commands, notes, memories, timers, reminders, search, settings, registries, and interface features remain available. Open-ended AI reasoning and vision require a configured provider.

## Are all roadmap skills installed?

No. Roadmap skills are explicitly marked Planned, Research, or Speculative and cannot execute tools.

## Does every catalog language support speech?

No. ERA catalogs ISO language metadata, but audio support depends on the browser, operating system, and installed voices.

## Can I use a local model?

Yes, if it exposes an OpenAI-compatible API. Localhost HTTP endpoints are supported.

## Where are API keys stored?

In the encrypted local provider vault or environment variables. Saved secret values are not returned to the renderer.

## Can ERA read huge files and folders?

ERA accepts their metadata without size rejection, but processing remains bounded. Large binary content is not loaded or uploaded automatically.

## Can ERA launch installed applications?

The desktop bridge exists, but operating-system discovery and launch adapters are still placeholders. Web shortcuts work now.

## Is ERA conscious?

No. ERA does not claim consciousness, feelings, independent will, or sovereign authority.

## Can ERA trade or transfer money?

No. Financial functions are educational analysis and decision support only.

## Why does the desktop package use a local HTTP server?

It lets the web and Electron editions share one API and security boundary while keeping provider credentials outside the renderer.
