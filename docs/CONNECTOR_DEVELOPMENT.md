# Connector Development

## Start read-only

New connectors should begin with a narrow read-only milestone. Examples:

- list upcoming calendar events;
- read one selected project;
- summarize one approved communication channel;
- retrieve public weather data.

## Connector contract

A connector should declare:

- ID and version;
- provider or protocol;
- authentication method;
- permissions;
- data direction;
- risk;
- confirmation rules;
- timeout and retry policy;
- revocation behavior;
- audit events.

## Authentication

Prefer OAuth with incremental scopes. Store tokens only in an encrypted trusted process. Never expose tokens to the renderer.

## Writes

Before enabling writes:

1. show an action preview;
2. display target and affected data;
3. require confirmation;
4. validate provider response;
5. create an execution receipt;
6. support rollback where the API allows it.

## Testing

Use synthetic accounts and fixtures. Test expired credentials, revoked scopes, rate limits, partial failure, timeout, duplicate execution, and cancellation.

## High-risk connectors

Financial, medical, smart-home, robotics, industrial, identity, and security connectors require additional review and must not begin with autonomous write access.
