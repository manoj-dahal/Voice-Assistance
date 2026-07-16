import { CalendarDays, Check, Clock3, Cloud, LockKeyhole, TimerReset } from 'lucide-react'
import type { ConversationAttachment } from '../lib/files'

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
  sources?: Array<{ title: string; url: string }>
  attachments?: ConversationAttachment[]
}

export interface ActiveTimer {
  id: string
  label: string
  endsAt: number
}

interface ActivityPanelProps {
  messages: ConversationMessage[]
  timers: ActiveTimer[]
  now: Date
  providerConnected: boolean
}

export function ActivityPanel({
  messages,
  timers,
  now,
  providerConnected
}: ActivityPanelProps) {
  const recent = messages.slice(-3).reverse()

  return (
    <aside className="activity-panel">
      <section className="today-card">
        <div className="today-date">
          <span>{now.toLocaleDateString([], { weekday: 'long' })}</span>
          <strong>{now.getDate()}</strong>
        </div>
        <div className="today-copy">
          <span>{now.toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
          <strong>{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>
        </div>
        <CalendarDays size={18} />
      </section>

      {timers.length > 0 && (
        <section className="timer-card">
          <div className="panel-title-row">
            <span><TimerReset size={15} /> Active timer</span>
            <i>Live</i>
          </div>
          {timers.slice(-1).map((timer) => (
            <div className="timer-detail" key={timer.id}>
              <strong>{timer.label}</strong>
              <span>
                Ends at {new Date(timer.endsAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          ))}
        </section>
      )}

      <section className="activity-section">
        <div className="panel-title-row">
          <span><Clock3 size={15} /> Recent activity</span>
          <small>Live</small>
        </div>
        <div className="activity-list">
          {recent.length === 0 ? (
            <div className="empty-activity">
              <div><Check size={16} /></div>
              <strong>All quiet</strong>
              <span>Your requests will appear here.</span>
            </div>
          ) : (
            recent.map((message) => (
              <div className="activity-item" key={message.id}>
                <span className={`activity-role ${message.role}`}>
                  {message.role === 'assistant' ? 'E' : 'Y'}
                </span>
                <div>
                  <strong>{message.role === 'assistant' ? 'ERA replied' : 'You asked'}</strong>
                  <p>{message.text}</p>
                  <time>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="connection-card">
        <div className="connection-icon"><Cloud size={17} /></div>
        <div>
          <span>Persona OS runtime</span>
          <strong>{providerConnected ? 'Orchestration online' : 'Local routing ready'}</strong>
        </div>
        <i className={providerConnected ? 'connected' : ''} />
      </section>

      <div className="privacy-note">
        <LockKeyhole size={13} />
        <span>Memories stay in this browser.</span>
      </div>
    </aside>
  )
}
