# Backup and Recovery

## Data to back up

### Markdown notes

Back up the configured `NOTES_DIR`, normally:

```text
resources/notes/
```

Desktop builds normally use an operating-system user-data path.

### Provider vault

Back up:

```text
.era/providers.vault
.era/vault.key
```

If `ERA_VAULT_SECRET` is used, preserve that secret separately. A vault without its matching key cannot be decrypted.

### Browser-local data

Projects, reminders, skill state, and agent tasks currently live in browser local storage. A complete encrypted export feature is planned but not yet implemented.

## Recovery order

1. Install the matching ERA version.
2. Restore Markdown notes.
3. Restore the encrypted vault and matching key or secret.
4. Start ERA.
5. Verify `/api/health`.
6. Test the provider.
7. Refresh the Markdown Bank.

## Corrupted vault

Do not overwrite a corrupted vault immediately. Preserve a copy, verify the configured secret, and reset only after accepting loss of stored provider keys.

## Lost vault key

Encrypted provider values cannot be recovered without the key. Remove the unreadable vault and re-enter provider credentials.

## Recovery limitations

Backup is not secure unless the backup destination is encrypted and access controlled. Do not place decrypted credentials in backup scripts or cloud-sync logs.
