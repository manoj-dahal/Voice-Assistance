# Performance

## Current strategy

ERA keeps deterministic commands local and sends only open-ended requests to configured AI providers.

Renderer optimizations include:

- lazy-loaded Markdown reader;
- bounded transcript history for provider requests;
- bounded file text extraction;
- metadata-only handling for large binary files;
- Canvas particle rendering;
- limited agent concurrency;
- bounded audit, reminder, and task storage.

## File and folder drops

There is no attachment-size rejection, but processing remains bounded:

- large text is not loaded completely;
- large images may skip preview decoding;
- folders retain only a bounded path sample;
- binary data is not placed into provider context.

## Provider metrics

Current provider timeout is bounded. Planned metrics include:

- median latency;
- 95th percentile latency;
- failure rate;
- fallback rate;
- token usage;
- estimated cost.

## Build output

Vite reports compressed and uncompressed output during `npm run build`. The Markdown view is split into a separate chunk.

## Performance rules

- Do not render thousands of unvirtualized rows.
- Do not load complete large files into memory.
- Abort obsolete network requests.
- Limit concurrent provider work.
- Keep expensive analysis behind user intent.
- Measure before publishing latency claims.

## Benchmark integrity

Performance numbers must include device, operating system, browser, network, model, sample size, and percentile. ERA must not publish unsupported sub-millisecond or reliability claims.
