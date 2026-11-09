// Mission and crew data for the dashboard. Endpoints and shapes are defined in docs/API_CONTRACT.md.
// Until the backend exists this serves simulated data from ./mock. Set VITE_USE_MOCK_DATA=false
// to call the real API through apiClient instead. Components cannot tell the difference.
import { apiRequest } from './apiClient'
import * as mock from './mock/mockApi'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

const enc = encodeURIComponent

function query(params) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
  const s = q.toString()
  return s ? `?${s}` : ''
}

/** True when data comes from the built-in simulator. The UI uses this to label panels. */
export const IS_SIMULATED = USE_MOCK

export const getMission = () => (USE_MOCK ? mock.getMission() : apiRequest('/mission'))

export const getAstronauts = () => (USE_MOCK ? mock.getAstronauts() : apiRequest('/astronauts'))

export const getLatestVitals = (astronautId) =>
  USE_MOCK ? mock.getLatestVitals(astronautId) : apiRequest(`/astronauts/${enc(astronautId)}/vitals/latest`)

/** options: { from, to, stepSeconds, pageSize } with from/to as ISO strings. */
export const getVitalsHistory = (astronautId, options = {}) =>
  USE_MOCK
    ? mock.getVitalsHistory(astronautId, options)
    : apiRequest(
        `/astronauts/${enc(astronautId)}/vitals${query({
          from: options.from, to: options.to, step: options.stepSeconds, pageSize: options.pageSize,
        })}`,
      )

export const getRisk = (astronautId) =>
  USE_MOCK ? mock.getRisk(astronautId) : apiRequest(`/astronauts/${enc(astronautId)}/risk`)

/** filters: { status: 'open' | 'acknowledged', severity } */
export const getAlerts = (filters = {}) =>
  USE_MOCK ? mock.getAlerts(filters) : apiRequest(`/alerts${query(filters)}`)

export const acknowledgeAlert = (alertId) =>
  USE_MOCK ? mock.acknowledgeAlert(alertId) : apiRequest(`/alerts/${enc(alertId)}/acknowledge`, { method: 'POST' })
