import useAsyncData from '@/hooks/useAsyncData'
import { getRisk } from '@/services/missionService'
import { POLL_MS } from '@/constants/dashboard'

// useRisk — AI risk assessment for one astronaut (RiskAssessment in docs/API_CONTRACT.md).
export default function useRisk(astronautId) {
  return useAsyncData(() => getRisk(astronautId), [astronautId], {
    intervalMs: POLL_MS.risk,
    enabled: Boolean(astronautId),
  })
}
