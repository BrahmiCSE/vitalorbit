import Icon from '@/components/layout/Icon'

/**
 * AlertSeverityBadge — icon plus word for an alert or anomaly severity.
 * Props: severity ('info' | 'warning' | 'emergency').
 * The icon shape and the word carry the meaning, so it does not rely on colour alone.
 */
const SEVERITY = {
  info:      { label: 'Info',      icon: 'info',      classes: 'bg-primary-soft text-primary ring-primary/40' },
  warning:   { label: 'Warning',   icon: 'warning',   classes: 'bg-warning-soft text-warning ring-warning/40' },
  emergency: { label: 'Emergency', icon: 'emergency', classes: 'bg-emergency-soft text-emergency ring-emergency/50' },
}

export default function AlertSeverityBadge({ severity }) {
  const s = SEVERITY[severity] ?? SEVERITY.info
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${s.classes}`}>
      <Icon name={s.icon} className="h-3.5 w-3.5" />
      {s.label}
    </span>
  )
}
