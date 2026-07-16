# Memory and Notes

## Memory layers

ERA presents four conceptual layers:

- working memory — current conversation;
- long-term memory — preferences and goals;
- semantic memory — concepts and facts;
- episodic memory — events and decisions.

Persistent browser memories can be viewed, filtered, removed, or disabled.

## Voice capture

A command beginning with:

```text
Remember that...
```

is sent to `POST /remember`.

ERA creates:

- a timestamped Markdown filename;
- YAML frontmatter;
- a heading derived from the first meaningful words;
- the captured content;
- a LIVE graph node and relation.

## Markdown bank

The Notes view supports:

- list and refresh;
- create;
- GFM preview;
- edit;
- confirmation-gated delete;
- ranked local search;
- provenance;
- suggested backlinks.

## Default paths

```text
resources/notes/captures/
```

Desktop packages override the notes directory with the operating system’s user-data directory.

## Sensitive content

ERA rejects credential-shaped content before writing persistent notes. Do not use the memory bank for passwords, private keys, recovery phrases, or payment data.

## Search

`GET /api/search` performs bounded local ranking over note title and content. It is not yet an embedding database. Results include snippets and provenance.

## Knowledge graph

The graph derives relationships using local textual similarity. New voice captures:

1. find the most related visible node;
2. appear at that node’s location;
3. animate into their stable position;
4. trigger a glow pulse;
5. move the graph camera to the new node.

Suggested relationships remain explainable local hints, not guaranteed facts.
