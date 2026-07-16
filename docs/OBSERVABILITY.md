# Observability

## Current visibility

ERA currently exposes:

- `/api/health`;
- provider readiness and active provider;
- local audit events;
- agent-task status and errors;
- reminder status;
- provider-test results;
- build and test logs.

## Logging principles

Logs must not contain:

- API keys;
- access tokens;
- private-key material;
- full sensitive prompts;
- payment information;
- private note content by default.

## Recommended events

- application start and stop;
- provider selected;
- provider fallback;
- request timeout;
- task cancellation;
- permission approval or denial;
- workflow start and completion;
- note write failure;
- vault decryption failure;
- desktop bridge rejection.

## Future metrics

- provider request count and latency;
- fallback rate;
- error rate by route;
- agent queue duration;
- reminder delivery delay;
- memory-search duration;
- renderer startup time;
- attachment metadata processing duration.

## User control

Telemetry should be disabled by default. Any future remote telemetry requires explicit opt-in, documented fields, retention limits, and an immediate disable option.
