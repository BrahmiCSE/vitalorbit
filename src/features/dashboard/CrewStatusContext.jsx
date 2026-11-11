import { createContext, useContext, useMemo } from 'react'
import useAsyncData from '@/hooks/useAsyncData'
import { getAstronauts } from '@/services/missionService'
import { POLL_MS } from '@/constants/dashboard'
import { worstStatus } from '@/utils/vitalStatus'

/**
 * CrewStatusProvider — loads the crew list once for the whole console and keeps it fresh.
 * The top bar reads the mission status from here and the dashboard reads the crew from here,
 * so the list is requested once, not once per component.
 *
 * useCrewStatus() returns:
 *   astronauts  Astronaut[] (empty until loaded)
 *   status      worst crew status ('healthy' | 'warning' | 'emergency'), or null with no data
 *   loading     true until the first response
 *   error       the error from the last request, if it failed (astronauts may still hold old data)
 *   ready       true once a response has arrived
 *   refresh     function that asks again now
 */
const CrewStatusContext = createContext(null)

export function CrewStatusProvider({ children }) {
  const crew = useAsyncData(() => getAstronauts(), [], { intervalMs: POLL_MS.crew })

  const value = useMemo(() => {
    const astronauts = crew.data ?? []
    return {
      astronauts,
      status: worstStatus(astronauts.map((a) => a.status)),
      loading: crew.loading,
      error: crew.error,
      ready: crew.data !== undefined,
      refresh: crew.refresh,
    }
  }, [crew.data, crew.loading, crew.error, crew.refresh])

  return <CrewStatusContext.Provider value={value}>{children}</CrewStatusContext.Provider>
}

export function useCrewStatus() {
  const ctx = useContext(CrewStatusContext)
  if (!ctx) throw new Error('useCrewStatus must be used inside <CrewStatusProvider> (it is mounted in AppShell).')
  return ctx
}
