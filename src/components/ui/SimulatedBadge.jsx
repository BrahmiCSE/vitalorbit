import { SIMULATED_NOTE } from '@/constants/dashboard'

/**
 * SimulatedBadge — small tag that marks a panel as fed by simulated data.
 * Props: label (default "Simulated"), className.
 */
export default function SimulatedBadge({ label = 'Simulated', className = '' }) {
  return (
    <span
      title={SIMULATED_NOTE}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-ink-muted ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      {label}
    </span>
  )
}
