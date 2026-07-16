# Voice and Languages

## Voice pipeline

```text
Microphone
   → Browser speech recognition
   → Interim transcript
   → Final transcript
   → Local command or AI route
   → Speech synthesis
```

ERA uses browser Web Speech APIs for the current implementation.

## Language catalog

The server exposes 7,867 ISO 639-3 records through `/api/languages`.

Each result includes:

- language name;
- ISO 639-3 identifier;
- ISO 639-1 identifier when available;
- BCP-47-oriented speech tag;
- type and scope;
- voice-support classification.

## Support classifications

- **Common browser support** — commonly implemented by browser and OS speech engines.
- **Browser dependent** — valid language code, but availability varies.
- **Catalog only** — can be selected as language metadata and provider guidance, but no audio support is promised.

## Switching language

Use Settings or say:

```text
Switch language to Nepali.
Speak in Cantonese.
```

The selected language affects:

- recognition language;
- installed-voice matching;
- speech-synthesis language;
- connected AI response guidance;
- concurrent agent-task response guidance.

## Voice profile

The default Soft Anime Heroine profile adjusts:

- rate;
- pitch;
- volume;
- automatic installed-voice ranking;
- response wording.

The browser cannot manufacture a missing character voice. Use Settings → Voice → Preview to compare installed voices.

## Privacy

Microphone access is initiated by the user. Emergency privacy lock stops listening and speech. A future always-listening wake phrase must use a local detector and a visible active indicator.
