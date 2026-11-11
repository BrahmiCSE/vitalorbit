import useAsyncData from '@/hooks/useAsyncData'
import { getVitalsHistory } from '@/services/missionService'
import { POLL_MS, TREND_RANGES } from '@/constants/dashboard'

/**
 * useAstronautTrend — past VitalReadings for one astronaut over a chosen range (see TREND_RANGES).
 * data is VitalReading[], oldest first. Reloads when the astronaut or range changes.
 */
export default function useAstronautTrend(astronautId, rangeId) {
  const range = TREND_RANGES.find((r) => r.id === rangeId) ?? TREND_RANGES[0]
  return useAsyncData(
    () => {
      const to = Date.now()
      return getVitalsHistory(astronautId, {
        from: new Date(to - range.minutes * 60 * 1000).toISOString(),
        to: new Date(to).toISOString(),
        stepSeconds: range.stepSeconds,
        pageSize: 500,
      })
    },
    [astronautId, range.id],
    { intervalMs: POLL_MS.trend, enabled: Boolean(astronautId) },
  )
}
