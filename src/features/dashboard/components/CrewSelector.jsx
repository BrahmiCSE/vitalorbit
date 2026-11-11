import StatusBadge from '@/components/ui/StatusBadge'
import { STATUS_STYLES } from '@/constants/status'
import { computeHealthScore } from '@/utils/healthScore'
import { initials } from '@/utils/format'

/**
 * CrewSelector — one card per astronaut. Click a card to make that astronaut the focus of the dashboard.
 * Props:
 *   astronauts  Astronaut[]
 *   vitalsById  { [astronautId]: VitalReading }, used for the health score (may be empty while loading)
 *   selectedId  id of the selected astronaut
 *   onSelect    function(id)
 */
export default function CrewSelector({ astronauts, vitalsById, selectedId, onSelect }) {
  return (
    <section aria-label="Crew">
      <h2 className="mb-3 text-sm font-medium text-ink-muted">Crew</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {astronauts.map((a) => {
          const selected = a.id === selectedId
          const style = STATUS_STYLES[a.status] ?? STATUS_STYLES.healthy
          const score = computeHealthScore(vitalsById?.[a.id])
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a.id)}
              aria-pressed={selected}
              aria-label={`${a.name}, ${a.role}, status ${style.label}, health score ${score ?? 'not available'}`}
              className={`glass flex items-center gap-3 p-4 text-left transition hover:border-primary/40 ${
                selected ? 'border-primary/60 shadow-glow' : ''
              } ${a.status === 'emergency' ? style.glow : ''}`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-2 ${style.ring} ${style.bg} ${style.text} font-display text-sm font-bold`}>
                {initials(a.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{a.name}</span>
                <span className="block truncate text-xs text-ink-muted">{a.role}</span>
                <span className="mt-2 block"><StatusBadge status={a.status} /></span>
              </span>
              <span className="text-right">
                <span className="telemetry block text-2xl">{score ?? '--'}</span>
                <span className="block text-xs text-ink-muted">score</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
