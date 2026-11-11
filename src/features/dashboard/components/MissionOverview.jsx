import GlassCard from '@/components/ui/GlassCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SimulatedBadge from '@/components/ui/SimulatedBadge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import useNow from '@/hooks/useNow'
import { IS_SIMULATED } from '@/services/missionService'
import { getMissionDay, getMissionLengthDays, getMissionProgress } from '@/utils/mission'
import { formatClockUtc, formatDateUtc } from '@/utils/format'

/**
 * MissionOverview — mission name, mission day, progress, crew status and alert counts.
 * Props:
 *   mission      Mission record, or undefined while loading
 *   loading      true until the mission has loaded
 *   error        error if the mission failed to load (shows a retry)
 *   onRetry      function that loads the mission again
 *   status       overall crew status ('healthy' | 'warning' | 'emergency') or null if unknown
 *   crewCount    number of astronauts
 *   alertCounts  { emergency, warning, info } counts of open alerts, or null if not loaded
 */
function Stat({ label, children }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}

export default function MissionOverview({ mission, loading, error, onRetry, status, crewCount, alertCounts }) {
  const now = useNow(1000)

  if (loading) {
    return (
      <GlassCard title="Mission overview">
        <div className="grid gap-6 lg:grid-cols-3" aria-busy="true">
          <Skeleton className="h-16 w-full" label="Loading mission" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </GlassCard>
    )
  }

  if (error && !mission) {
    return (
      <GlassCard title="Mission overview">
        <ErrorState title="Could not load the mission" message="Mission details are unavailable right now." onRetry={onRetry} />
      </GlassCard>
    )
  }

  const day = getMissionDay(mission.launchDate, now)
  const length = getMissionLengthDays(mission.launchDate, mission.plannedEndDate)
  const progress = getMissionProgress(mission.launchDate, mission.plannedEndDate, now)
  const percent = Math.round(progress * 100)
  const openTotal = alertCounts ? alertCounts.emergency + alertCounts.warning + alertCounts.info : null

  return (
    <GlassCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{mission.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {mission.vehicle} · {mission.phase}
          </p>
        </div>
        {(IS_SIMULATED || mission.source === 'simulated') && <SimulatedBadge />}
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Mission day">
          {day === 0 ? (
            <p className="telemetry text-3xl">Pre-launch</p>
          ) : (
            <p className="telemetry text-3xl">
              {day}
              {length > 0 && <span className="ml-1 text-base text-ink-muted">of {length}</span>}
            </p>
          )}
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Mission progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            {formatDateUtc(mission.launchDate)} to {formatDateUtc(mission.plannedEndDate)}
          </p>
        </Stat>

        <Stat label="Crew status">
          <div className="flex items-center gap-3">
            {status ? <StatusBadge status={status} /> : <span className="text-sm text-ink-muted">No data</span>}
          </div>
          <p className="mt-2 text-xs text-ink-muted">{crewCount} crew members</p>
        </Stat>

        <Stat label="Open alerts">
          {alertCounts ? (
            <>
              <p className="telemetry text-3xl">{openTotal}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {alertCounts.emergency} emergency · {alertCounts.warning} warning · {alertCounts.info} info
              </p>
            </>
          ) : (
            <p className="telemetry text-3xl text-ink-muted">--</p>
          )}
        </Stat>

        <Stat label="Mission clock">
          <p className="telemetry text-3xl">{formatClockUtc(now).replace(' UTC', '')}</p>
          <p className="mt-1 text-xs text-ink-muted">UTC</p>
        </Stat>
      </div>
    </GlassCard>
  )
}
