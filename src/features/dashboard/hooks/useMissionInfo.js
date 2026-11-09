import useAsyncData from '@/hooks/useAsyncData'
import { getMission } from '@/services/missionService'

// useMissionInfo — loads the mission record (name, launch date, planned end). Loaded once.
export default function useMissionInfo() {
  return useAsyncData(() => getMission(), [])
}
