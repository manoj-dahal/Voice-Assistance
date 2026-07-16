import { BellRing, Plus, RotateCw, Trash2 } from 'lucide-react'
import { FormEvent, useState } from 'react'
import type { ReminderItem } from '../lib/storage'

interface ReminderDockProps {
  reminders: ReminderItem[]
  onAdd: (content: string, dueAt: string) => void
  onDelete: (id: string) => void
}

export function ReminderDock({ reminders, onAdd, onDelete }: ReminderDockProps) {
  const [content, setContent] = useState('')
  const [minutes, setMinutes] = useState('30')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const delay = Number(minutes)
    if (!content.trim() || !Number.isFinite(delay) || delay <= 0) return
    onAdd(content.trim(), new Date(Date.now() + delay * 60_000).toISOString())
    setContent('')
  }

  const active = reminders
    .filter((reminder) => !reminder.completed)
    .sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime())

  return (
    <aside className="reminder-dock">
      <header><span><BellRing size={14} /> REMINDERS</span><strong>{active.length}</strong></header>
      <form onSubmit={submit}>
        <input value={content} onChange={(event) => setContent(event.target.value)} placeholder="What should ERA remind you about?" />
        <label><input type="number" min="1" max="525600" value={minutes} onChange={(event) => setMinutes(event.target.value)} /><span>minutes</span></label>
        <button type="submit" disabled={!content.trim()}><Plus size={13} /> Add</button>
      </form>
      <div className="reminder-list">
        {active.length === 0 ? <div className="reminder-empty">No active reminders.</div> : active.slice(0, 8).map((reminder) => (
          <article key={reminder.id}>
            <span>{reminder.recurrence !== 'none' ? <RotateCw size={11} /> : <BellRing size={11} />}</span>
            <div><strong>{reminder.content}</strong><small>{new Date(reminder.dueAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</small></div>
            <button type="button" onClick={() => onDelete(reminder.id)} aria-label={`Delete reminder ${reminder.content}`}><Trash2 size={12} /></button>
          </article>
        ))}
      </div>
    </aside>
  )
}
