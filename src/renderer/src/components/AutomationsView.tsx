import {
  CalendarClock,
  Coffee,
  Focus,
  MoonStar,
  Play,
  ShieldCheck,
  Workflow
} from 'lucide-react'

export interface AutomationDefinition {
  id: string
  title: string
  description: string
  schedule: string
  prompt: string
  steps: string[]
  icon: typeof Coffee
}

interface AutomationsViewProps {
  enabled: string[]
  onToggle: (id: string) => void
  onRun: (automation: AutomationDefinition) => void
}

const automations: AutomationDefinition[] = [
  {
    id: 'daily-brief',
    title: 'Daily brief',
    description: 'A clean overview of your day, priorities, and connected context.',
    schedule: 'Every weekday · 8:30 AM',
    icon: Coffee,
    prompt: 'Give me my daily brief',
    steps: ['Review available date and workspace context', 'Generate a concise priority briefing', 'Return recommendations without changing external services']
  },
  {
    id: 'focus-sprint',
    title: 'Focus sprint',
    description: 'Start a protected 25-minute work block with a gentle finish alert.',
    schedule: 'Run on demand',
    icon: Focus,
    prompt: 'Start a 25 minute timer',
    steps: ['Start a local 25-minute timer', 'Show live timer status', 'Notify you when the focus block ends']
  },
  {
    id: 'meeting-prep',
    title: 'Meeting readiness',
    description: 'Surface the next meeting and prepare a short context checklist.',
    schedule: '10 minutes before events',
    icon: CalendarClock,
    prompt: 'Help me prepare for my next meeting',
    steps: ['Identify the meeting objective from supplied context', 'Draft a preparation checklist', 'Ask before accessing any future calendar connector']
  },
  {
    id: 'evening-reset',
    title: 'Evening reset',
    description: 'Review open thoughts and shape tomorrow’s first priority.',
    schedule: 'Sunday–Thursday · 6:00 PM',
    icon: MoonStar,
    prompt: 'Help me plan tomorrow',
    steps: ['Review goals shared in this conversation', 'Identify unfinished priorities', 'Propose tomorrow’s first action for approval']
  }
]

export function AutomationsView({ enabled, onToggle, onRun }: AutomationsViewProps) {
  return (
    <div className="workspace-view automations-view">
      <header className="view-header">
        <div>
          <span className="view-eyebrow"><Workflow size={14} /> Quietly working for you</span>
          <h1>Automations</h1>
          <p>Shape repeatable routines, then start them with a sentence.</p>
        </div>
        <div className="view-stat">
          <strong>{enabled.length}</strong>
          <span>enabled</span>
        </div>
      </header>

      <div className="automation-grid">
        {automations.map((automation) => {
          const { id, title, description, schedule, icon: Icon } = automation
          const isEnabled = enabled.includes(id)
          return (
            <article className={isEnabled ? 'automation-card enabled' : 'automation-card'} key={id}>
              <div className="automation-card-top">
                <div className="automation-icon"><Icon size={20} /></div>
                <button
                  type="button"
                  className={isEnabled ? 'toggle on' : 'toggle'}
                  onClick={() => onToggle(id)}
                  aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${title}`}
                  aria-pressed={isEnabled}
                >
                  <span />
                </button>
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
              <div className="automation-schedule"><CalendarClock size={13} /> {schedule}</div>
              <button className="run-automation" type="button" onClick={() => onRun(automation)}>
                <Play size={13} fill="currentColor" /> Run now
              </button>
            </article>
          )
        })}
      </div>

      <div className="automation-note">
        <ShieldCheck size={18} />
        <div>
          <strong>Designed for intentional control</strong>
          <p>ERA previews connected-service actions before they run. Local timers and memories stay on this device.</p>
        </div>
      </div>
    </div>
  )
}
