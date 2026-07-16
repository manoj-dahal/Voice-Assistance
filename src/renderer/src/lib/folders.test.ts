import { describe, expect, it } from 'vitest'
import { entryFromDataTransferItem } from './folders'

describe('folder drop support', () => {
  it('uses the browser entry API when a directory is dropped', () => {
    const entry = {
      isFile: false as const,
      isDirectory: true as const,
      name: 'project',
      fullPath: '/project',
      createReader: () => ({ readEntries: () => undefined })
    }
    const item = { webkitGetAsEntry: () => entry } as unknown as DataTransferItem
    expect(entryFromDataTransferItem(item)).toBe(entry)
  })

  it('returns null when the browser does not expose directory entries', () => {
    expect(entryFromDataTransferItem({} as DataTransferItem)).toBeNull()
  })
})
