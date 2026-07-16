export type AttachmentKind = 'folder' | 'image' | 'text' | 'code' | 'pdf' | 'document' | 'archive' | 'audio' | 'video' | 'data' | 'other'

export interface ConversationAttachment {
  id: string
  name: string
  mimeType: string
  size: number
  kind: AttachmentKind
  previewUrl?: string
  textContent?: string
  fileCount?: number
  samplePaths?: string[]
}

const codeExtensions = new Set([
  'c', 'cc', 'cpp', 'cs', 'css', 'go', 'html', 'java', 'js', 'jsx', 'kt', 'mdx',
  'php', 'py', 'rb', 'rs', 'sh', 'sql', 'swift', 'ts', 'tsx', 'vue', 'xml', 'yaml', 'yml'
])
const textExtensions = new Set(['txt', 'md', 'log', 'rtf'])
const dataExtensions = new Set(['csv', 'json', 'jsonl', 'tsv'])
const documentExtensions = new Set(['doc', 'docx', 'odt', 'ppt', 'pptx', 'xls', 'xlsx'])
const archiveExtensions = new Set(['7z', 'gz', 'rar', 'tar', 'tgz', 'zip'])

function extension(name: string) {
  return name.toLocaleLowerCase().split('.').pop() || ''
}

export function classifyAttachment(name: string, mimeType = ''): AttachmentKind {
  const ext = extension(name)
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (codeExtensions.has(ext)) return 'code'
  if (dataExtensions.has(ext)) return 'data'
  if (textExtensions.has(ext) || mimeType.startsWith('text/')) return 'text'
  if (documentExtensions.has(ext)) return 'document'
  if (archiveExtensions.has(ext)) return 'archive'
  return 'other'
}

export function canReadAsText(kind: AttachmentKind) {
  return kind === 'text' || kind === 'code' || kind === 'data'
}

export function formatFileSize(bytes: number) {
  if (bytes < 1_024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes < 1_099_511_627_776) return `${(bytes / 1_073_741_824).toFixed(2)} GB`
  return `${(bytes / 1_099_511_627_776).toFixed(2)} TB`
}

export function attachmentContext(attachments: ConversationAttachment[]) {
  if (!attachments.length) return ''
  let remainingTextBudget = 60_000
  return attachments.map((attachment) => {
    const header = `${attachment.kind === 'folder' ? 'Folder' : 'File'}: ${attachment.name}\nType: ${attachment.mimeType || attachment.kind}\nSize: ${formatFileSize(attachment.size)}${attachment.fileCount !== undefined ? `\nFiles: ${attachment.fileCount}` : ''}`
    if (attachment.kind === 'folder') {
      const paths = attachment.samplePaths?.length
        ? `\nSample paths (bounded local manifest):\n${attachment.samplePaths.join('\n')}`
        : ''
      return `${header}${paths}\nFolder contents were not uploaded automatically.`
    }
    if (attachment.textContent && remainingTextBudget > 0) {
      const limit = Math.min(20_000, remainingTextBudget)
      const excerpt = attachment.textContent.slice(0, limit)
      remainingTextBudget -= excerpt.length
      const truncated = excerpt.length < attachment.textContent.length ? '\n[Content truncated locally]' : ''
      return `${header}\nLocal text content:\n---\n${excerpt}${truncated}\n---`
    }
    return `${header}\nBinary content was not sent. Only file metadata is available.`
  }).join('\n\n')
}
