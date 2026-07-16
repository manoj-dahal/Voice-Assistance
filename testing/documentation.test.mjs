import { describe, expect, it } from 'vitest'
import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const docsDirectory = resolve(projectRoot, 'docs')
const names = (await readdir(docsDirectory)).filter((name) => name.endsWith('.md')).sort()
const documents = Object.fromEntries(await Promise.all(names.map(async (name) => [
  name,
  await readFile(resolve(docsDirectory, name), 'utf8')
])))

describe('project documentation', () => {
  it('contains a comprehensive indexed Markdown library', () => {
    expect(names).toHaveLength(34)
    expect(names).toContain('README.md')
    expect(names).toContain('ARCHITECTURE.md')
    expect(names).toContain('SECURITY.md')
    expect(names).toContain('THREAT_MODEL.md')
    expect(names).toContain('TROUBLESHOOTING.md')
  })

  it('gives every document one top-level title', () => {
    for (const [name, markdown] of Object.entries(documents)) {
      const withoutFencedCode = markdown.replace(/```[\s\S]*?```/g, '')
      const titles = withoutFencedCode.match(/^#\s+.+$/gm) || []
      expect(titles, name).toHaveLength(1)
    }
  })

  it('contains no broken relative Markdown links', async () => {
    for (const [name, markdown] of Object.entries(documents)) {
      const links = [...markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
      for (const match of links) {
        const target = match[1]
        if (/^(https?:|mailto:|#)/.test(target)) continue
        const path = resolve(docsDirectory, target.split('#')[0])
        expect((await stat(path)).isFile(), `${name} -> ${target}`).toBe(true)
      }
    }
  })

  it('does not use unsupported universal completion language', () => {
    for (const [name, markdown] of Object.entries(documents)) {
      expect(markdown, name).not.toMatch(/all systems (?:are )?complete/i)
      expect(markdown, name).not.toMatch(/(?:claims?|provides?|supports?) unlimited context/i)
    }
  })
})
