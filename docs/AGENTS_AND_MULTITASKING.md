# Agents and Multitasking

## Agent roles

ERA exposes bounded logical specialist roles:

- Research;
- Memory;
- Knowledge;
- Planning;
- Automation;
- Voice;
- Screen;
- Security;
- Finance;
- Collaboration.

They are orchestration roles, not conscious independent entities.

## Concurrent tasks

The Agent Tasks view supports:

- one to four concurrent requests;
- priority scheduling;
- queue pause and resume;
- dependencies;
- cancellation;
- retries;
- result and error inspection;
- local task recovery after reload.

## Mission template

```text
Research ──┐
           ├── Planning ── Knowledge synthesis
Security ──┘
```

Research and Security run concurrently. Planning receives their completed results. Synthesis receives Planning’s result.

## Creating a mission

```text
Start a multi-agent mission for reviewing the ERA release plan.
```

## Privacy

- Offline mode cancels active provider requests.
- Balanced mode applies sensitive-context checks.
- Tasks remain visible and cancellable.
- No hidden background agents continue after cancellation.

## Current boundary

Agent tasks call configured language models. They do not autonomously send email, change calendars, execute shell commands, control devices, or spend money.
