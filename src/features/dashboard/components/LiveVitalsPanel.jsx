import GlassCard from '@/components/ui/GlassCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SimulatedBadge from '@/components/ui/SimulatedBadge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import HealthScoreRing from './HealthScoreRing'
import VitalTile from './VitalTile'
import useNow from '@/hooks/useNow'
import { evaluateReading, bloodPressureStatus, describeRange, describeRangeValues } from '@/utils/vitalStatus'
import { computeHealthScore } from '@/utils/healthScore'
import { formatNumber, formatTimeAgo } from '@/utils/format'
import { VITAL_LIMITS } from '@/constants/vitals'

/**
 * LiveVitalsPanel — the selected astronaut's health score and live vital readings
 * (heart rate, SpO2, blood pressure, temperature, respiration).
 * Props:
 *   astronaut  Astronaut (name, role, status)
 *   reading    latest VitalReading, or undefined if not available
 *   loading    true until the first reading arrives
 *   error      error from the last request (shows an error if there is no reading, a note if there is)
 *   onRetry    function that loads again
 */
export default function LiveVitalsPanel({ astronaut, reading, loading, error, onRetry }) {
  const now = useNow(1000)
  const { metrics } = evaluateReading(reading)
  const score = computeHealthScore(reading)
  const stale = Boolean(error && reading)

  return (
    <GlassCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{astronaut.name}</h2>
          <p className="mt-0.5 text-sm text-ink-muted">{astronaut.role}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={astronaut.status} />
            <SimulatedBadge />
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted" aria-live="off">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 ${stale ? '' : 'animate-ping'}`} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {reading ? `Live, updated ${formatTimeAgo(reading.timestamp, now)}` : 'Waiting for readings'}
          </p>
        </div>
        <HealthScoreRing score={score} status={astronaut.status} />
      </div>

      <div className="mt-5">
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-busy="true">
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" label={i === 0 ? 'Loading vitals' : undefined} />)}
          </div>
        )}

        {!loading && error && !reading && (
          <ErrorState title="Could not load live vitals" message="The latest readings for this astronaut are unavailable." onRetry={onRetry} />
        )}

        {!loading && !reading && !error && (
          <p className="text-sm text-ink-muted">No readings have been received for this astronaut yet.</p>
        )}

        {reading && (
          <>
            {stale && (
              <p role="status" className="mb-3 text-sm text-warning">Could not refresh. Showing the last readings received.</p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <VitalTile
                label="Heart rate" unit="bpm" value={formatNumber(reading.heartRate)}
                status={metrics.heartRate} range={describeRange('heartRate')}
              />
              <VitalTile
                label="SpO2" unit="%" value={formatNumber(reading.spo2)}
                status={metrics.spo2} range={describeRange('spo2')}
              />
              <VitalTile
                label="Blood pressure" unit="mmHg"
                value={`${formatNumber(reading.bloodPressure?.systolic)}/${formatNumber(reading.bloodPressure?.diastolic)}`}
                status={bloodPressureStatus(reading)}
                range={`${describeRangeValues('systolic')} / ${describeRangeValues('diastolic')} mmHg`}
              />
              <VitalTile
                label="Temperature" unit={VITAL_LIMITS.bodyTemperatureC.unit} value={formatNumber(reading.bodyTemperatureC, 1)}
                status={metrics.bodyTemperatureC} range={describeRange('bodyTemperatureC')}
              />
              <VitalTile
                label="Respiration" unit="br/min" value={formatNumber(reading.respiratoryRate)}
                status={metrics.respiratoryRate} range={describeRange('respiratoryRate')}
              />
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Health score is calculated here from the latest readings. 100 is ideal; any warning keeps it below 80.
            </p>
          </>
        )}
      </div>
    </GlassCard>
  )
}
