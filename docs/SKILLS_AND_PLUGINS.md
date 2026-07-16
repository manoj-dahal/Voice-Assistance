# Skills and Plugins

## Skill types

ERA distinguishes:

- built-in skills — implemented local capabilities;
- custom skills — simulation-only user definitions;
- plugin manifests — validated metadata for future adapters;
- MCP manifests — validated tool declarations for future MCP clients;
- roadmap skills — non-operational implementation targets.

## Skill metadata

A skill declares:

- unique ID;
- name and description;
- category and source;
- trigger phrases;
- permissions;
- risk;
- execution steps;
- confirmation requirement;
- implementation status.

## Enable and disable

Disabling a built-in skill blocks matching voice and text commands. Roadmap skills cannot be enabled as operational tools.

## Custom builder

The builder accepts:

- name;
- description;
- comma-separated triggers;
- one simulation step per line;
- risk;
- permissions;
- confirmation policy.

Creation never installs executable code.

## Manifest validation

Version-1 plugin and MCP manifests require:

```json
{
  "schemaVersion": 1,
  "id": "com.example.weather",
  "name": "Weather Reader",
  "description": "Reads approved weather data",
  "source": "mcp",
  "version": "1.0.0",
  "triggers": ["show weather"],
  "permissions": ["provider.call"],
  "risk": "low",
  "requiresConfirmation": false,
  "tools": ["weather.current"],
  "endpoint": "http://localhost:3001"
}
```

Remote endpoints require HTTPS. Localhost may use HTTP. Unknown permissions are rejected. High-impact permissions require confirmation.

## Safe future execution

Before external plugin execution is added, ERA needs:

- package signatures;
- publisher identity;
- sandboxing;
- network and filesystem scopes;
- timeout and memory limits;
- revocation;
- rollback where possible;
- execution receipts.
