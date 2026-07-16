# Accessibility

## Current foundations

ERA includes:

- semantic buttons and forms;
- visible keyboard focus;
- ARIA labels for key controls;
- reduced-motion support;
- text alternatives for meaningful images;
- typed transcript alongside voice;
- keyboard command palette;
- non-voice alternatives for primary actions.

## Keyboard navigation

The universal command palette opens with:

```text
Ctrl + Shift + E
```

Inside the palette:

- Arrow Up/Down changes selection;
- Enter activates;
- Escape closes.

## Voice accessibility

Voice must remain optional. Any important voice action should have a visible control or text-command alternative.

## Language accessibility

The language catalog distinguishes metadata support from real audio support. Users must not be told that a language has working recognition or TTS when the browser lacks it.

## Motion and visual effects

Particle, orbit, graph, and pulse animations are reduced when the operating system requests reduced motion.

## Future work

- high-contrast theme selector;
- adjustable text scale;
- full screen-reader audit;
- skip links and landmark review;
- dyslexia-friendly font option;
- captions synchronized to speech output;
- automated axe testing;
- WCAG 2.2 AA contrast report.

## Contribution requirement

New features must remain operable without color alone, without a mouse, and without speech input.
