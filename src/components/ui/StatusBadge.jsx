import { STATUS, STATUS_STYLES } from '@/constants/status'

/**
 * StatusBadge — pill showing healthy / warning / emergency.
 * Props: status ('healthy' | 'warning' | 'emergency').
 */
export default function StatusBadge({ status = STATUS.HEALTHY }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.healthy
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${s.text} ${s.bg} ${s.ring}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  )
}
