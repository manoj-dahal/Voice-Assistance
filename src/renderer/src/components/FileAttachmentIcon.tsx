import {
  Archive,
  AudioLines,
  Braces,
  Database,
  File,
  FileCode2,
  FileImage,
  FileText,
  FolderArchive,
  FileType2,
  Film
} from 'lucide-react'
import type { AttachmentKind } from '../lib/files'

export function FileAttachmentIcon({ kind, size = 15 }: { kind: AttachmentKind; size?: number }) {
  if (kind === 'folder') return <FolderArchive size={size} />
  if (kind === 'image') return <FileImage size={size} />
  if (kind === 'code') return <FileCode2 size={size} />
  if (kind === 'text') return <FileText size={size} />
  if (kind === 'data') return <Database size={size} />
  if (kind === 'pdf' || kind === 'document') return <FileType2 size={size} />
  if (kind === 'archive') return <Archive size={size} />
  if (kind === 'audio') return <AudioLines size={size} />
  if (kind === 'video') return <Film size={size} />
  if (kind === 'other') return <File size={size} />
  return <Braces size={size} />
}
