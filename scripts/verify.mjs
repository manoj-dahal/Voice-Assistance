#!/usr/bin/env node

import { spawnSync } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const checks = [
  ['test'],
  ['run', 'build'],
  ['audit']
]

for (const args of checks) {
  console.log(`\n> npm ${args.join(' ')}`)
  const result = spawnSync(npm, args, { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}

console.log('\nERA verification completed successfully.')
