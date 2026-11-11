import { STATUS_STYLES } from '@/constants/status'

// Full class names are written out so Tailwind can find them.
const TILE_BORDER = { healthy: 'border-white/10', warning: 'border-warning/50', emergency: 'border-emergency/60' }

/**
 * VitalTile — one live reading: label, big value, unit and its normal range.
 * Props: label, value (string, already formatted), unit, status ('healthy' | 'warning' | 'emergency' | null), range (text).
 * The status is shown as a word as well as a colour, so it does not rely on colour alone.
 */
export default function VitalTile({ label, value, unit, status, range }) {
  const style = status ? STATUS_STYLES[status] : null
  return (
    <div className={`rounded-xl border bg-white/[0.03] p-4 ${TILE_BORDER[status] ?? 'border-white/10'}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">{label}</p>
        {style && <span className={`text-xs font-medium ${style.text}`}>{style.label === 'Healthy' ? 'Normal' : style.label}</span>}
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className={`telemetry text-3xl font-medium ${style && status !== 'healthy' ? style.text : ''}`}>{value}</span>
        <span className="text-sm text-ink-muted">{unit}</span>
      </p>
      {range && <p className="mt-1 text-xs text-ink-muted">Normal {range}</p>}
    </div>
  )
}
