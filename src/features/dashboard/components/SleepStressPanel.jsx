import GlassCard from '@/components/ui/GlassCard'
import SimulatedBadge from '@/components/ui/SimulatedBadge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import { STATUS_STYLES } from '@/constants/status'
import { SLEEP_TARGET_HOURS, VITAL_LIMITS } from '@/constants/vitals'
import { evaluateMetric } from '@/utils/vitalStatus'
import { formatNumber } from '@/utils/format'

/**
 * SleepStressPanel — last night's sleep against the target, and the current stress index on a zoned scale.
 * Props: reading (latest VitalReading or undefined), loading, error, onRetry.
 */
const word = (status) => (status === 'healthy' ? 'Normal' : STATUS_STYLES[status].label)

export default function SleepStressPanel({ reading, loading, error, onRetry }) {
  const sleepStatus = evaluateMetric('sleepHours', reading?.sleepHours)
  const stressStatus = evaluateMetric('stressIndex', reading?.stressIndex)
  const sleepPercent = reading ? Math.max(0, Math.min(100, (reading.sleepHours / SLEEP_TARGET_HOURS) * 100)) : 0
  const stress = reading ? Math.max(0, Math.min(100, reading.stressIndex)) : 0

  // Stress scale zones follow the limits in constants/vitals.js.
  const warnAt = VITAL_LIMITS.stressIndex.warnHigh
  const emergencyAt = VITAL_LIMITS.stressIndex.emergencyHigh

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ink-muted">Sleep and stress</h2>
        <SimulatedBadge />
      </div>

      {loading && (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-16" label="Loading sleep and stress" />
          <Skeleton className="h-16" />
        </div>
      )}

      {!loading && !reading && error && (
        <ErrorState compact title="Could not load sleep and stress" message="Try again in a moment." onRetry={onRetry} />
      )}

      {!loading && !reading && !error && <p className="text-sm text-ink-muted">No data yet.</p>}

      {reading && (
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm text-ink-muted">Sleep last night</p>
              {sleepStatus && <span className={`text-xs font-medium ${STATUS_STYLES[sleepStatus].text}`}>{word(sleepStatus)}</span>}
            </div>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="telemetry text-3xl font-medium">{formatNumber(reading.sleepHours, 1)}</span>
              <span className="text-sm text-ink-muted">h of {SLEEP_TARGET_HOURS} h target</span>
            </p>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10"
              role="meter" aria-label="Sleep against target" aria-valuemin={0} aria-valuemax={SLEEP_TARGET_HOURS} aria-valuenow={reading.sleepHours}
            >
              <div className={`h-full rounded-full ${sleepStatus === 'warning' ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${sleepPercent}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm text-ink-muted">Stress index</p>
              {stressStatus && <span className={`text-xs font-medium ${STATUS_STYLES[stressStatus].text}`}>{word(stressStatus)}</span>}
            </div>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="telemetry text-3xl font-medium">{formatNumber(reading.stressIndex)}</span>
              <span className="text-sm text-ink-muted">/ 100</span>
            </p>
            <div
              className="relative mt-3 flex h-2 w-full overflow-hidden rounded-full"
              role="meter" aria-label="Stress index" aria-valuemin={0} aria-valuemax={100} aria-valuenow={reading.stressIndex}
            >
              <div className="h-full bg-healthy/40" style={{ width: `${warnAt}%` }} />
              <div className="h-full bg-warning/40" style={{ width: `${emergencyAt - warnAt}%` }} />
              <div className="h-full bg-emergency/40" style={{ width: `${100 - emergencyAt}%` }} />
            </div>
            <div className="relative -mt-3.5 h-5" aria-hidden="true">
              <span className="absolute top-0 h-5 w-1 -translate-x-1/2 rounded bg-ink" style={{ left: `${stress}%` }} />
            </div>
            <p className="mt-1 text-xs text-ink-muted">Normal up to {warnAt}. Warning from {warnAt}. Emergency above {emergencyAt}.</p>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
