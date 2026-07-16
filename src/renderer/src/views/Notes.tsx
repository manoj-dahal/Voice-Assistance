import {
  Edit3,
  FileCode2,
  FilePlus2,
  FileText,
  RefreshCw,
  Save,
  ShieldAlert,
  Trash2,
  X
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Note {
  filename: string
  title: string
  content: string
  createdAt: string
}

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selected, setSelected] = useState<Note | null>(null)
  const [editing, setEditing] = useState(false)
  const [editingFilename, setEditingFilename] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null)

  const fetchNotes = useCallback(async (preserveFilename?: string) => {
    try {
      const response = await fetch('/api/notes')
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Notes could not be loaded')
      setNotes(body.notes)
      const requestedFilename = window.localStorage.getItem('era.notes.open')
      const filename = preserveFilename || requestedFilename || selected?.filename
      if (filename) {
        setSelected(body.notes.find((note: Note) => note.filename === filename) || null)
        if (requestedFilename) window.localStorage.removeItem('era.notes.open')
      }
      setError('')
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Notes could not be loaded')
    } finally {
      setLoading(false)
    }
  }, [selected?.filename])

  useEffect(() => {
    void fetchNotes()
    const interval = window.setInterval(() => void fetchNotes(), 5_000)
    return () => window.clearInterval(interval)
  }, [fetchNotes])

  const startCreating = () => {
    setEditingFilename(null)
    setTitle('')
    setContent('')
    setEditing(true)
  }

  const startEditing = () => {
    if (!selected) return
    setEditingFilename(selected.filename)
    setTitle(selected.title)
    setContent(selected.content)
    setEditing(true)
  }

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(
        editingFilename ? `/api/notes/${encodeURIComponent(editingFilename)}` : '/api/notes',
        {
          method: editingFilename ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        }
      )
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Note could not be saved')
      setEditing(false)
      setEditingFilename(null)
      await fetchNotes(body.note.filename)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Note could not be saved')
    } finally {
      setSaving(false)
    }
  }

  const deleteNote = async () => {
    if (!deleteTarget) return
    try {
      const response = await fetch(`/api/notes/${encodeURIComponent(deleteTarget.filename)}`, {
        method: 'DELETE'
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Note could not be deleted')
      if (selected?.filename === deleteTarget.filename) setSelected(null)
      setDeleteTarget(null)
      await fetchNotes()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Note could not be deleted')
    }
  }

  return (
    <div className="notes-bank-view">
      <aside className="notes-index">
        <header>
          <div><FileCode2 size={16} /><span>MEMORY BANK</span></div>
          <div><small>{notes.length} ITEMS</small><button type="button" onClick={startCreating} title="Create note"><FilePlus2 size={15} /></button></div>
        </header>
        <button type="button" className="notes-refresh" onClick={() => void fetchNotes()}><RefreshCw size={12} /> Refresh disk notes</button>
        <div className="notes-list">
          {loading ? <div className="notes-empty">Reading captures…</div> : notes.length === 0 ? (
            <div className="notes-empty"><FileText size={25} /><strong>No Markdown notes</strong><span>Create one, or say “remember that…”</span></div>
          ) : notes.map((note) => (
            <button type="button" className={selected?.filename === note.filename && !editing ? 'active' : ''} key={note.filename} onClick={() => { setSelected(note); setEditing(false) }}>
              <div><strong>{note.title}</strong><small>{new Date(note.createdAt).toLocaleDateString()}</small></div>
              <span
                onClick={(event) => { event.stopPropagation(); setDeleteTarget(note) }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    setDeleteTarget(note)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Delete ${note.title}`}
              ><Trash2 size={13} /></span>
            </button>
          ))}
        </div>
      </aside>

      <section className="notes-document">
        {error && <div className="notes-error"><ShieldAlert size={14} /> {error}</div>}
        {editing ? (
          <div className="notes-editor">
            <header><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="ENTER NOTE TITLE…" autoFocus /><button type="button" onClick={() => setEditing(false)}><X size={18} /></button></header>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write your note in Markdown…" />
            <footer><span>Stored in NOTES_DIR/captures</span><button type="button" onClick={() => void saveNote()} disabled={!title.trim() || !content.trim() || saving}><Save size={14} /> {saving ? 'SAVING…' : editingFilename ? 'UPDATE MEMORY' : 'SAVE TO MEMORY'}</button></footer>
          </div>
        ) : selected ? (
          <>
            <header className="note-reader-header"><div><FileCode2 size={16} /><span>{selected.title}</span></div><button type="button" onClick={startEditing}><Edit3 size={14} /> Edit</button></header>
            <article className="markdown-reader"><ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.content}</ReactMarkdown></article>
          </>
        ) : (
          <div className="note-reader-empty"><FileText size={43} /><span>SELECT A DATA NODE OR CREATE NEW</span><button type="button" onClick={startCreating}><FilePlus2 size={14} /> New note</button></div>
        )}
      </section>

      {deleteTarget && (
        <div className="note-delete-confirm">
          <ShieldAlert size={17} />
          <div><strong>Delete “{deleteTarget.title}”?</strong><span>This permanently removes the Markdown file.</span></div>
          <button type="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button type="button" className="danger" onClick={() => void deleteNote()}>Delete</button>
        </div>
      )}
    </div>
  )
}
