import useAsyncData from '@/hooks/useAsyncData'
import { getLatestVitals } from '@/services/missionService'
import { POLL_MS } from '@/constants/dashboard'

/**
 * useCrewVitals — latest VitalReading for every astronaut, refreshed every few seconds.
 * data is an object keyed by astronaut id: { ast_001: VitalReading, ... }.
 * If some astronauts fail and others succeed, the successful ones are returned and the
 * failed ones are simply missing. If all fail, the hook reports the error.
 */
export default function useCrewVitals(astronauts) {
  const ids = astronauts.map((a) => a.id).join(',')
  return useAsyncData(
    async () => {
      const results = await Promise.allSettled(astronauts.map((a) => getLatestVitals(a.id)))
      const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
      if (ok.length === 0) {
        const failed = results.find((r) => r.status === 'rejected')
        throw failed ? failed.reason : new Error('No vitals returned')
      }
      return Object.fromEntries(ok.map((reading) => [reading.astronautId, reading]))
    },
    [ids],
    { intervalMs: POLL_MS.vitals, enabled: astronauts.length > 0 },
  )
}
