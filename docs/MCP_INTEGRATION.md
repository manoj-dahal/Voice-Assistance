# MCP Integration

## Current status

ERA validates MCP-style skill manifests but does not yet connect to or execute arbitrary MCP servers.

## Manifest requirements

- schema version;
- namespaced ID;
- human-readable name and description;
- version;
- trigger phrases;
- permissions;
- risk;
- confirmation policy;
- declared tools;
- HTTPS or localhost endpoint.

Registration validates metadata only.

## Safe connection flow

A future MCP client should:

1. inspect server identity;
2. retrieve the tool list;
3. compare tools with the manifest;
4. show requested permissions;
5. require user approval;
6. restrict network and filesystem access;
7. validate tool inputs and outputs;
8. enforce timeouts;
9. log a concise trace;
10. support immediate disconnection.

## Tool execution

High-impact tools require a per-action checkpoint. Tool output must be treated as untrusted input and must not override ERA’s security policy.

## Secrets

MCP credentials belong in the trusted encrypted vault, never in manifests, prompts, renderer storage, or logs.

## Failure behavior

A disconnected or failing MCP server must not cause ERA to claim an action succeeded. ERA should report the failure and offer a safe alternative.
