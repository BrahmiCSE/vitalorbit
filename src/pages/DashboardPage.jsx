import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { useCrewStatus } from '@/features/dashboard/CrewStatusContext'
import useMissionInfo from '@/features/dashboard/hooks/useMissionInfo'
import useCrewVitals from '@/features/dashboard/hooks/useCrewVitals'
import useOpenAlerts from '@/features/dashboard/hooks/useOpenAlerts'
import MissionOverview from '@/features/dashboard/components/MissionOverview'
import CrewSelector from '@/features/dashboard/components/CrewSelector'
import LiveVitalsPanel from '@/features/dashboard/components/LiveVitalsPanel'
import SleepStressPanel from '@/features/dashboard/components/SleepStressPanel'
import AlertsPanel from '@/features/dashboard/components/AlertsPanel'
import HealthTrendPanel from '@/features/dashboard/components/HealthTrendPanel'
import AiSummaryPanel from '@/features/dashboard/components/AiSummaryPanel'

// Mission Control dashboard. This page only assembles the dashboard feature; the panels
// live in src/features/dashboard. The selected astronaut is kept in the address (?crew=ast_001)
// so a view can be shared or reloaded.
export default function DashboardPage() {
  const crew = useCrewStatus()
  const mission = useMissionInfo()
  const vitals = useCrewVitals(crew.astronauts)
  const alerts = useOpenAlerts()
  const [params, setParams] = useSearchParams()

  const astronauts = crew.astronauts
  const selected = astronauts.find((a) => a.id === params.get('crew')) ?? astronauts[0]

  const selectAstronaut = (id) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('crew', id)
        return next
      },
      { replace: true },
    )

  const namesById = useMemo(() => Object.fromEntries(astronauts.map((a) => [a.id, a.name])), [astronauts])

  const alertCounts = useMemo(() => {
    if (!alerts.data) return null
    const counts = { emergency: 0, warning: 0, info: 0 }
    for (const a of alerts.data) if (a.severity in counts) counts[a.severity] += 1
    return counts
  }, [alerts.data])

  const vitalsById = vitals.data ?? {}

  return (
    <>
      <PageHeader title="Mission Control" description="Mission status, crew health, live vitals, alerts and an AI summary in one view." />

      <div className="space-y-4">
        <MissionOverview
          mission={mission.data}
          loading={mission.loading}
          error={mission.error}
          onRetry={mission.refresh}
          status={crew.status}
          crewCount={astronauts.length}
          alertCounts={alertCounts}
        />

        {crew.loading && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" label={i === 0 ? 'Loading crew' : undefined} />)}
          </div>
        )}

        {!crew.loading && !crew.ready && crew.error && (
          <GlassCard title="Crew">
            <ErrorState title="Could not load the crew" message="The crew list is unavailable, so vitals and trends cannot be shown." onRetry={crew.refresh} />
          </GlassCard>
        )}

        {crew.ready && astronauts.length === 0 && (
          <GlassCard title="Crew">
            <EmptyState title="No crew members found" message="Nobody is assigned to this mission yet." />
          </GlassCard>
        )}

        {selected && (
          <>
            {crew.error && (
              <p role="status" className="text-sm text-warning">Could not refresh the crew list. Showing the last status received.</p>
            )}

            <CrewSelector astronauts={astronauts} vitalsById={vitalsById} selectedId={selected.id} onSelect={selectAstronaut} />

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <LiveVitalsPanel
                  astronaut={selected}
                  reading={vitalsById[selected.id]}
                  loading={vitals.loading}
                  error={vitals.error}
                  onRetry={vitals.refresh}
                />
                <SleepStressPanel reading={vitalsById[selected.id]} loading={vitals.loading} error={vitals.error} onRetry={vitals.refresh} />
                <HealthTrendPanel astronaut={selected} />
              </div>

              <div className="space-y-4">
                <AlertsPanel
                  alerts={alerts.data}
                  loading={alerts.loading}
                  error={alerts.error}
                  onRetry={alerts.refresh}
                  namesById={namesById}
                  selectedId={selected.id}
                  onAcknowledge={alerts.acknowledge}
                  pendingIds={alerts.pendingIds}
                  ackError={alerts.ackError}
                />
                <AiSummaryPanel astronaut={selected} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
