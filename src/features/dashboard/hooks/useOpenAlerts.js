import { useCallback, useState } from 'react'
import useAsyncData from '@/hooks/useAsyncData'
import { acknowledgeAlert, getAlerts } from '@/services/missionService'
import { POLL_MS } from '@/constants/dashboard'

/**
 * useOpenAlerts — open (not yet acknowledged) alerts for the whole crew.
 * Returns the useAsyncData fields plus:
 *   acknowledge(id)  marks one alert acknowledged. The alert leaves the list once the server
 *                    confirms; if the request fails it stays and ackError is set.
 *   pendingIds       Set of alert ids with a request in progress
 *   ackError         message to show if the last acknowledge failed, or null
 */
export default function useOpenAlerts() {
  const alerts = useAsyncData(() => getAlerts({ status: 'open' }), [], { intervalMs: POLL_MS.alerts })
  const { mutate, refresh } = alerts
  const [pendingIds, setPendingIds] = useState(() => new Set())
  const [ackError, setAckError] = useState(null)

  const acknowledge = useCallback(
    async (id) => {
      setAckError(null)
      setPendingIds((prev) => new Set(prev).add(id))
      try {
        await acknowledgeAlert(id)
        mutate((list) => list.filter((a) => a.id !== id))
      } catch (error) {
        setAckError(error.code === 'NOT_FOUND' ? 'That alert has already cleared.' : 'Could not acknowledge the alert. Try again.')
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        refresh()
      }
    },
    [mutate, refresh],
  )

  return { ...alerts, acknowledge, pendingIds, ackError }
}
