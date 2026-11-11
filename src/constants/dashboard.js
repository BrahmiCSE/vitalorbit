// Dashboard timing and chart settings.

// How often each panel asks for fresh data (milliseconds).
export const POLL_MS = {
  crew: 10000,
  vitals: 5000,
  alerts: 10000,
  trend: 30000,
  risk: 30000,
}

// Time ranges offered on the trend chart.
// stepSeconds is the spacing between points we ask the API for.
export const TREND_RANGES = [
  { id: '1h', label: '1 hour', minutes: 60, stepSeconds: 60 },
  { id: '6h', label: '6 hours', minutes: 360, stepSeconds: 300 },
  { id: '24h', label: '24 hours', minutes: 1440, stepSeconds: 900 },
]

export const DEFAULT_TREND_RANGE = '1h'

// Order used when sorting alerts: most serious first.
export const SEVERITY_ORDER = { emergency: 0, warning: 1, info: 2 }

// Shown on every panel that is fed by the simulator.
export const SIMULATED_NOTE = 'Simulated data. No real sensors or AI model are connected yet.'
