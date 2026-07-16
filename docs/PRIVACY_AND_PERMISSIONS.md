# Privacy and Permissions

## Privacy modes

### Balanced

Connected reasoning is available, but sensitive-looking context is blocked before transmission.

### Connected

Configured providers may receive approved request context. Secret detection still protects persistent notes.

### Offline

Only deterministic local commands are available. Agent-provider tasks pause or cancel.

### Temporary

Conversation may remain in active memory, but new persistent memories are blocked.

## Emergency privacy lock

The lock:

- stops recognition and speech;
- closes overlays;
- switches to offline mode;
- pauses memory writes;
- blocks connected requests.

Unlocking does not restore earlier cloud or memory preferences automatically.

## Permission categories

Skills may declare:

- microphone and speech output;
- memory and notes read/write;
- provider calls and web research;
- image upload;
- application launch;
- notifications;
- files read/write;
- calendar read/write;
- email read/draft/send;
- terminal execution.

Unknown permissions are rejected by the skill-manifest validator.

## Permission principles

- Grant the smallest scope.
- Prefer one-action and read-only grants.
- Show permission expansion before updates.
- Make revocation available.
- Confirm destructive, financial, external communication, and system-modifying actions.
- Never treat user convenience as permission.
