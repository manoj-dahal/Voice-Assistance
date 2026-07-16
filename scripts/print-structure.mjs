#!/usr/bin/env node

import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const ignored = new Set(['.git', 'dist', 'node_modules', '.era'])

async function print(directory, prefix = '') {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => !ignored.has(entry.name))
    .sort((left, right) => Number(left.isFile()) - Number(right.isFile()) || left.name.localeCompare(right.name))

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    const last = index === entries.length - 1
    console.log(`${prefix}${last ? '└──' : '├──'} ${entry.name}`)
    if (entry.isDirectory()) {
      await print(resolve(directory, entry.name), `${prefix}${last ? '    ' : '│   '}`)
    }
  }
}

console.log('Voice-Assistance/')
await print(root)
