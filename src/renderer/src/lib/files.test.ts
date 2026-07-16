import { describe, expect, it } from 'vitest'
import { attachmentContext, classifyAttachment, formatFileSize } from './files'

describe('dashboard file attachments', () => {
  it('classifies common file types for transcript icons', () => {
    expect(classifyAttachment('photo.png', 'image/png')).toBe('image')
    expect(classifyAttachment('app.ts', '')).toBe('code')
    expect(classifyAttachment('report.pdf', '')).toBe('pdf')
    expect(classifyAttachment('records.csv', '')).toBe('data')
    expect(classifyAttachment('backup.zip', '')).toBe('archive')
  })

  it('formats file sizes', () => {
    expect(formatFileSize(500)).toBe('500 B')
    expect(formatFileSize(2_048)).toBe('2.0 KB')
    expect(formatFileSize(2_097_152)).toBe('2.0 MB')
    expect(formatFileSize(2_147_483_648)).toBe('2.00 GB')
    expect(formatFileSize(2_199_023_255_552)).toBe('2.00 TB')
  })

  it('includes local text but never invents binary contents', () => {
    const context = attachmentContext([
      { id: '1', name: 'note.txt', mimeType: 'text/plain', size: 5, kind: 'text', textContent: 'hello' },
      { id: '2', name: 'file.pdf', mimeType: 'application/pdf', size: 100, kind: 'pdf' },
      { id: '3', name: 'project', mimeType: 'inode/directory', size: 4_096, kind: 'folder', fileCount: 2, samplePaths: ['/project/a.ts', '/project/b.ts'] }
    ])
    expect(context).toContain('hello')
    expect(context).toContain('Binary content was not sent')
    expect(context).toContain('Folder: project')
    expect(context).toContain('Files: 2')
  })
})
