import { AlertTriangle, Check, ShieldCheck, X } from 'lucide-react'
import { useEffect } from 'react'
import type { RiskLevel } from '../lib/orchestrator'

export interface ActionProposal {
  title: string
  purpose: string
  impact: string
  steps: string[]
  risk: RiskLevel
  confirmLabel?: string
}

interface ActionConfirmationModalProps {
  proposal: ActionProposal
  onConfirm: () => void
  onCancel: () => void
}

export function ActionConfirmationModal({
  proposal,
  onConfirm,
  onCancel
}: ActionConfirmationModalProps) {
  useEffect(() => {
    const cancelOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', cancelOnEscape)
    return () => window.removeEventListener('keydown', cancelOnEscape)
  }, [onCancel])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="confirmation-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div className={`confirmation-shield ${proposal.risk}`}>
            {proposal.risk === 'high' ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
          </div>
          <button type="button" onClick={onCancel} aria-label="Cancel action"><X size={17} /></button>
        </header>
        <span className="confirmation-eyebrow">Action preview · {proposal.risk} risk</span>
        <h2 id="confirmation-title">{proposal.title}</h2>
        <p>{proposal.purpose}</p>

        <div className="confirmation-plan">
          <strong>Execution plan</strong>
          {proposal.steps.map((step, index) => (
            <div key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>

        <div className="impact-note">
          <AlertTriangle size={14} />
          <span><strong>Expected impact:</strong> {proposal.impact}</span>
        </div>

        <footer>
          <button type="button" className="cancel-action" onClick={onCancel}>Cancel</button>
          <button type="button" className="confirm-action" onClick={onConfirm}>
            <Check size={15} /> {proposal.confirmLabel || 'Approve and continue'}
          </button>
        </footer>
      </section>
    </div>
  )
}
