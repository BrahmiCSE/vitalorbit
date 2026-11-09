import { lazy, Suspense, useState } from 'react'
import GlassCard from '@/components/ui/GlassCard'
import SimulatedBadge from '@/components/ui/SimulatedBadge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import useAstronautTrend from '../hooks/useAstronautTrend'
import { TREND_METRICS } from '../trendMetrics'
import { DEFAULT_TREND_RANGE, TREND_RANGES } from '@/constants/dashboard'

// The chart library is large, so it loads only when this panel is shown (keeps the other pages light).
const TrendChart = lazy(() => import('./TrendChart'))

/**
 * HealthTrendPanel — health trend chart for one astronaut with a metric picker and a time range picker.
 * It loads its own history. Props: astronaut (Astronaut). The chosen metric and range are kept when the astronaut changes.
 */
function Pill({ active, onClick, children }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={active}
      className={`rounded-lg px-3 py-1.5 text-sm transition ${active ? 'bg-primary-soft text-primary' : 'text-ink-muted hover:bg-white/5 hover:text-ink'}`}
    >
      {children}
    </button>
  )
}

export default function HealthTrendPanel({ astronaut }) {
  const [metricId, setMetricId] = useState(TREND_METRICS[0].id)
  const [rangeId, setRangeId] = useState(DEFAULT_TREND_RANGE)
  const metric = TREND_METRICS.find((m) => m.id === metricId)
  const { data, loading, error, refresh } = useAstronautTrend(astronaut.id, rangeId)

  return (
    <GlassCard>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ink-muted">Health trends: {astronaut.name}</h2>
        <SimulatedBadge />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Metric">
          {TREND_METRICS.map((m) => (
            <Pill key={m.id} active={m.id === metricId} onClick={() => setMetricId(m.id)}>{m.label}</Pill>
          ))}
        </div>
        <div className="flex gap-1" role="group" aria-label="Time range">
          {TREND_RANGES.map((r) => (
            <Pill key={r.id} active={r.id === rangeId} onClick={() => setRangeId(r.id)}>{r.label}</Pill>
          ))}
        </div>
      </div>

      {loading && <Skeleton className="h-64" label="Loading trend chart" />}

      {!loading && error && !data && (
        <ErrorState title="Could not load the trend" message="Past readings are unavailable right now." onRetry={refresh} />
      )}

      {!loading && data && data.length === 0 && (
        <EmptyState title="No readings in this time range" message="Pick a longer range or check again later." />
      )}

      {data && data.length > 0 && (
        <>
          {error && <p role="status" className="mb-2 text-sm text-warning">Could not refresh. Showing the last data received.</p>}
          <Suspense fallback={<Skeleton className="h-64" label="Loading chart" />}>
            <TrendChart readings={data} metric={metric} />
          </Suspense>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
            {metric.series.length > 1 &&
              metric.series.map((s) => (
                <span key={s.key} className={`inline-flex items-center gap-1.5 ${s.colorClass}`}>
                  <span className="h-0.5 w-4 rounded bg-current" aria-hidden="true" />
                  <span className="text-ink-muted">{s.name}</span>
                </span>
              ))}
            {metric.limitKey && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded-sm bg-healthy/20" aria-hidden="true" />
                Shaded band is the normal range
              </span>
            )}
            <span>Times in UTC</span>
          </div>
        </>
      )}
    </GlassCard>
  )
}
