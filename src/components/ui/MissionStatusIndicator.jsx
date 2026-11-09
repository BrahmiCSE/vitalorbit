import { STATUS } from '@/constants/status'

/**
 * MissionStatusIndicator — a glowing dot plus the overall mission state.
 * Props: status ('healthy' | 'warning' | 'emergency').
 * It only DISPLAYS a status it is given. Deciding the status is a later stage.
 */
const MISSION_STATES = {
  healthy:   { label: 'Nominal',   dot: 'bg-healthy',   text: 'text-healthy' },
  warning:   { label: 'Caution',   dot: 'bg-warning',   text: 'text-warning' },
  emergency: { label: 'Emergency', dot: 'bg-emergency', text: 'text-emergency' },
}

export default function MissionStatusIndicator({ status = STATUS.HEALTHY }) {
  const s = MISSION_STATES[status] ?? MISSION_STATES.healthy
  return (
    <div
      role="status"
      aria-label={`Mission status: ${s.label}`}
      className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${s.dot}`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${s.dot}`} />
      </span>
      <span className="hidden text-ink-muted sm:inline">Mission</span>
      <span className={`font-medium ${s.text}`}>{s.label}</span>
    </div>
  )
}
