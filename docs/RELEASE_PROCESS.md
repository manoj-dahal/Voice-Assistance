# Release Process

## Version preparation

1. Update `package.json` version.
2. Update documentation and roadmap status.
3. Run `npm run verify`.
4. Review dependency audit.
5. Verify Electron configuration and icon resources.
6. Test a clean install where possible.

## Tagging

Use a semantic version tag:

```bash
git tag v0.2.0
git push origin v0.2.0
```

Create semantic version tags only after manually validated platform packages exist. This branch intentionally excludes GitHub workflow files because the connected GitHub App cannot push them.

## Artifact review

Check:

- filenames and versions;
- Windows installer behavior;
- macOS launch and entitlement behavior;
- Linux AppImage and Debian installation;
- application icon;
- startup health;
- notes and provider-vault locations;
- uninstall and user-data behavior.

## Signing

Unsigned CI artifacts are for testing. Production distribution should use platform signing and, for macOS, notarization.

## Release notes

Describe:

- verified features;
- security changes;
- migrations;
- fixed issues;
- known limitations;
- connector or permission changes.

Never describe roadmap skills as shipped functionality.
