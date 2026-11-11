import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import SimulatedBadge from '@/components/ui/SimulatedBadge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import AlertSeverityBadge from './AlertSeverityBadge'
import useNow from '@/hooks/useNow'
import { SEVERITY_ORDER } from '@/constants/dashboard'
import { formatTimeAgo } from '@/utils/format'

/**
 * AlertsPanel — open alerts for the whole crew, most serious first, with an Acknowledge button.
 * Props:
 *   alerts       Alert[] (open ones), or undefined while loading
 *   loading      true until the first response
 *   error        error from the last request
 *   onRetry      function that loads again
 *   namesById    { [astronautId]: name } used to show who an alert is about
 *   selectedId   id of the astronaut currently in focus (their alerts get a marker)
 *   onAcknowledge function(alertId)
 *   pendingIds   Set of alert ids being acknowledged
 *   ackError     message to show if an acknowledge failed, or null
 */
export default function AlertsPanel({ alerts, loading, error, onRetry, namesById, selectedId, onAcknowledge, pendingIds, ackError }) {
  const now = useNow(15000)

  const sorted = alerts
    ? [...alerts].sort(
        (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9) || Date.parse(b.createdAt) - Date.parse(a.createdAt),
      )
    : []

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ink-muted">
          Open alerts{alerts ? <span className="telemetry ml-2 text-ink">{alerts.length}</span> : null}
        </h2>
        <SimulatedBadge />
      </div>

      {loading && (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-14" label="Loading alerts" />
          <Skeleton className="h-14" />
        </div>
      )}

      {!loading && error && !alerts && <ErrorState compact title="Could not load alerts" message="Open alerts are unavailable right now." onRetry={onRetry} />}

      {error && alerts && <p role="status" className="mb-3 text-sm text-warning">Could not refresh. Showing the last alerts received.</p>}
      {ackError && <p role="alert" className="mb-3 text-sm text-warning">{ackError}</p>}

      {alerts && sorted.length === 0 && (
        <EmptyState icon="check" tone="healthy" title="No open alerts" message="Nothing needs attention right now." />
      )}

      {sorted.length > 0 && (
        <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {sorted.map((a) => {
            const pending = pendingIds?.has(a.id)
            const forSelected = a.astronautId === selectedId
            return (
              <li key={a.id} className={`rounded-xl border bg-white/[0.03] p-3 ${forSelected ? 'border-primary/40' : 'border-white/10'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <AlertSeverityBadge severity={a.severity} />
                  <span className="text-xs text-ink-muted">{formatTimeAgo(a.createdAt, now)}</span>
                </div>
                <p className="mt-2 text-sm">{a.message}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-ink-muted">{namesById?.[a.astronautId] ?? a.astronautId}</span>
                  <Button
                    variant="ghost" size="sm" disabled={pending} onClick={() => onAcknowledge(a.id)}
                    aria-label={`Acknowledge alert: ${a.message}`}
                  >
                    {pending ? 'Saving' : 'Acknowledge'}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </GlassCard>
  )
}
