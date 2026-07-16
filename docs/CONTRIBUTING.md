# Contributing to ERA

## Principles

Contributions should be:

- honest about implementation status;
- privacy preserving;
- permission scoped;
- testable;
- accessible;
- reversible where practical;
- explicit about external data flow.

## Before submitting

```bash
npm install
npm run verify
```

## Pull request checklist

- [ ] The change has a clear user outcome.
- [ ] Permissions and risks are documented.
- [ ] External actions use confirmation when required.
- [ ] Secrets are not logged or returned to the renderer.
- [ ] Tests cover success and failure paths.
- [ ] Documentation is updated.
- [ ] Roadmap functionality is not described as complete.
- [ ] The renderer does not gain unrestricted Node access.

## Skill contributions

Provide:

- namespaced ID;
- trigger phrases;
- permission list;
- risk level;
- confirmation policy;
- execution steps;
- tests;
- rollback or failure behavior.

Plugin manifests do not grant execution automatically.

## Connector contributions

Start with read-only access. Include:

- authentication and revocation;
- exact scopes;
- data direction;
- retention behavior;
- rate-limit handling;
- failure recovery;
- synthetic test fixtures.

## Documentation style

Use short sections, concrete commands, and explicit limitations. Avoid unsupported performance numbers and universal capability claims.
