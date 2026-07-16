import type { ConversationAttachment } from './files'

interface BrowserFileEntry {
  isFile: true
  isDirectory: false
  name: string
  fullPath: string
  file(success: (file: File) => void, error?: (error: DOMException) => void): void
}

interface BrowserDirectoryReader {
  readEntries(success: (entries: BrowserEntry[]) => void, error?: (error: DOMException) => void): void
}

interface BrowserDirectoryEntry {
  isFile: false
  isDirectory: true
  name: string
  fullPath: string
  createReader(): BrowserDirectoryReader
}

export type BrowserEntry = BrowserFileEntry | BrowserDirectoryEntry

interface DirectorySummary {
  fileCount: number
  totalSize: number
  samplePaths: string[]
}

function fileFromEntry(entry: BrowserFileEntry) {
  return new Promise<File>((resolve, reject) => entry.file(resolve, reject))
}

async function entriesFromDirectory(entry: BrowserDirectoryEntry) {
  const reader = entry.createReader()
  const collected: BrowserEntry[] = []
  while (true) {
    const batch = await new Promise<BrowserEntry[]>((resolve, reject) =>
      reader.readEntries(resolve, reject))
    if (!batch.length) break
    collected.push(...batch)
  }
  return collected
}

async function walkEntry(entry: BrowserEntry, summary: DirectorySummary) {
  if (entry.isFile) {
    const file = await fileFromEntry(entry)
    summary.fileCount += 1
    summary.totalSize += file.size
    if (summary.samplePaths.length < 250) summary.samplePaths.push(entry.fullPath || file.name)
    return
  }

  const children = await entriesFromDirectory(entry)
  for (const child of children) await walkEntry(child, summary)
}

export async function summarizeDroppedDirectory(
  entry: BrowserDirectoryEntry,
  createId: () => string
): Promise<ConversationAttachment> {
  const summary: DirectorySummary = { fileCount: 0, totalSize: 0, samplePaths: [] }
  await walkEntry(entry, summary)
  return {
    id: createId(),
    name: entry.name,
    mimeType: 'inode/directory',
    size: summary.totalSize,
    kind: 'folder',
    fileCount: summary.fileCount,
    samplePaths: summary.samplePaths
  }
}

export function entryFromDataTransferItem(item: DataTransferItem): BrowserEntry | null {
  const itemWithEntry = item as unknown as {
    webkitGetAsEntry?: () => unknown
  }
  return (itemWithEntry.webkitGetAsEntry?.() as BrowserEntry | null | undefined) || null
}
