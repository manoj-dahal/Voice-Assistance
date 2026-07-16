#!/usr/bin/env node

/**
 * ERA local server entrypoint.
 *
 * Keeping the executable in /bin lets package scripts, desktop launchers, and
 * future installers use one stable command while trusted modules remain under
 * /src/main.
 */
import '../src/main/index.mjs'
