// Mock implementation of the endpoints in docs/API_CONTRACT.md.
// Components never import this file. They go through services/missionService.js, which picks
// the mock or the real API, so swapping in the FastAPI backend needs no component changes.
//
// Test and demo switches (read from the page address, for example /dashboard?sim=error:risk):
//   ?sim=error            every request fails
//   ?sim=error:risk,alerts only the named endpoints fail (mission, crew, vitals, trend, alerts, risk)
//   ?sim=empty            no crew and no alerts
//   ?sim=slow             every response takes 2.5 seconds
import { MOCK_CREW, MOCK_MISSION } from './crew.js'
import { generateReading, generateSeries, toContractTime } from './simulator.js'
import { generateRisk } from './risk.js'
import { STATUS } from '../../constants/status.js'
import { VITAL_LIMITS, readMetric } from '../../constants/vitals.js'
import { evaluateReading, bloodPressureStatus, describeRange, formatWithUnit } from '../../utils/vitalStatus.js'

const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE
const READING_INTERVAL_MS = 5000
const DEFAULT_LATENCY_MS = 200
const SLOW_LATENCY_MS = 2500

const ALERT_KEYS = ['heartRate', 'spo2', 'respiratoryRate', 'bloodPressure', 'bodyTemperatureC', 'stressIndex', 'sleepHours']
const RANK = { healthy: 0, warning: 1, emergency: 2 }

// Acknowledgements live in memory only. They reset when the page reloads.
const acknowledged = new Set()

export function resetMockState() {
  acknowledged.clear()
}

/** Read the simulation switch from a search string like "?sim=error:risk,alerts". */
export function parseSimMode(search = '') {
  const raw = new URLSearchParams(search).get('sim')
  if (!raw) return { mode: 'none', targets: null }
  const [mode, list] = raw.split(':')
  if (!['error', 'empty', 'slow'].includes(mode)) return { mode: 'none', targets: null }
  const targets = list ? new Set(list.split(',').map((s) => s.trim()).filter(Boolean)) : null
  return { mode, targets }
}

function apiError(code, status, message) {
  return Object.assign(new Error(message), { code, status })
}

function pause(ms) {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve()
}

// Common wrapper: latency, simulated failures, and a fixed "now" for tests.
async function respond(endpoint, ctx, work) {
  const sim = ctx.sim ?? parseSimMode(globalThis.location?.search ?? '')
  const latency = ctx.latencyMs ?? (sim.mode === 'slow' ? SLOW_LATENCY_MS : DEFAULT_LATENCY_MS)
  await pause(latency)
  if (sim.mode === 'error' && (!sim.targets || sim.targets.has(endpoint))) {
    throw apiError('INTERNAL_ERROR', 500, 'Simulated server error')
  }
  return work({ now: ctx.now ?? Date.now(), empty: sim.mode === 'empty' })
}

function findProfile(id) {
  const profile = MOCK_CREW.find((p) => p.id === id)
  if (!profile) throw apiError('NOT_FOUND', 404, 'Astronaut not found')
  return profile
}

const aligned = (ms, step) => Math.floor(ms / step) * step

function statusAt(profile, key, timeMs) {
  const reading = generateReading(profile, timeMs)
  if (key === 'bloodPressure') return bloodPressureStatus(reading)
  return evaluateReading(reading).metrics[key]
}

function alertMessage(key, reading, status) {
  const label = status === STATUS.EMERGENCY ? 'critical' : 'outside the normal range'
  if (key === 'bloodPressure') {
    const { systolic, diastolic } = reading.bloodPressure
    return `Blood pressure ${systolic}/${diastolic} mmHg is ${label}`
  }
  const l = VITAL_LIMITS[key]
  const value = readMetric(reading, key)
  return `${l.label} ${formatWithUnit(value, l.unit)} is ${label} (expected ${describeRange(key)})`
}

// Which simulator effects (see crew.js) can push each alert metric around.
const EPISODE_EFFECTS = {
  heartRate: ['heartRate'],
  spo2: ['spo2'],
  respiratoryRate: ['respiratoryRate'],
  bloodPressure: ['systolic', 'diastolic'],
  bodyTemperatureC: ['bodyTemperatureC'],
  stressIndex: ['stressIndex'],
  sleepHours: [],
}

// An alert belongs to one "cycle": one episode of the profile, or one UTC day for steady metrics.
// Using the cycle in the alert id keeps the id stable for as long as the cycle lasts, even if a
// value flickers around a limit, so an acknowledged alert does not come back by itself.
// Episode alerts are dated from the first reading in the episode that reached the alert level.
// Steady alerts (such as last night's sleep) are dated from the start of the UTC day.
function cycleFor(profile, key, timeMs) {
  const episode = profile.episode
  if (episode && EPISODE_EFFECTS[key].some((k) => episode.effects[k] !== undefined)) {
    const period = episode.periodMin * MINUTE
    const shift = episode.phase / (2 * Math.PI)
    const index = Math.floor(timeMs / period + shift)
    const start = Math.ceil(((index - shift) * period) / READING_INTERVAL_MS) * READING_INTERVAL_MS
    return { id: `e${index}`, start, scan: true }
  }
  const index = Math.floor(timeMs / DAY)
  return { id: `d${index}`, start: index * DAY, scan: false }
}

// First reading (on the 5 second grid) in the cycle that reached `level` or worse, never later than now.
// Scanning from the start of the cycle each time makes the answer the same on every poll.
function onsetTime(profile, key, level, cycle, nowMs) {
  if (!cycle.scan) return cycle.start
  for (let t = cycle.start; t <= nowMs; t += READING_INTERVAL_MS) {
    if (RANK[statusAt(profile, key, t)] >= RANK[level]) return t
  }
  return nowMs
}

// Build every current alert from the simulated vitals.
// A move from warning to emergency gets a new id, so it shows as a new, unacknowledged alert.
function buildAlerts(rawNowMs) {
  const alerts = []
  const nowMs = aligned(rawNowMs, READING_INTERVAL_MS) // alerts follow the 5 second reading grid

  for (const profile of MOCK_CREW) {
    const current = generateReading(profile, nowMs)

    for (const key of ALERT_KEYS) {
      const status = key === 'bloodPressure' ? bloodPressureStatus(current) : evaluateReading(current).metrics[key]
      if (status !== STATUS.WARNING && status !== STATUS.EMERGENCY) continue

      const cycle = cycleFor(profile, key, nowMs)
      const id = `alt_${profile.id}_${key}_${status}_${cycle.id}`
      alerts.push({
        id,
        astronautId: profile.id,
        severity: status,
        message: alertMessage(key, current, status),
        createdAt: toContractTime(onsetTime(profile, key, status, cycle, nowMs)),
        acknowledged: acknowledged.has(id),
      })
    }
  }

  // One informational alert so that the info severity is visible in the demo.
  const dayStart = aligned(nowMs, DAY)
  const infoId = 'alt_info_calibration'
  alerts.push({
    id: infoId,
    astronautId: 'ast_001',
    severity: 'info',
    message: 'Wearable sensor calibration completed',
    createdAt: toContractTime(dayStart + 2 * 60 * MINUTE),
    acknowledged: acknowledged.has(infoId),
  })

  return alerts
}

// ---- Endpoints ----

/** GET /mission */
export function getMission(ctx = {}) {
  return respond('mission', ctx, () => ({ ...MOCK_MISSION }))
}

/** GET /astronauts */
export function getAstronauts(ctx = {}) {
  return respond('crew', ctx, ({ now, empty }) => {
    if (empty) return []
    return MOCK_CREW.map((p) => {
      const reading = generateReading(p, now)
      return { id: p.id, name: p.name, role: p.role, status: evaluateReading(reading).overall, lastUpdated: reading.timestamp }
    })
  })
}

/** GET /astronauts/:id/vitals/latest */
export function getLatestVitals(id, ctx = {}) {
  return respond('vitals', ctx, ({ now }) => generateReading(findProfile(id), aligned(now, READING_INTERVAL_MS)))
}

/**
 * GET /astronauts/:id/vitals?from=&to=&step=&pageSize=
 * from and to are ISO strings. step is seconds between readings (default 5, the raw interval).
 * Returns the newest `pageSize` readings, oldest first.
 */
export function getVitalsHistory(id, { from, to, stepSeconds = 5, pageSize = 1000 } = {}, ctx = {}) {
  return respond('trend', ctx, ({ now }) => {
    const profile = findProfile(id)
    const toMs = to ? Date.parse(to) : now
    const fromMs = from ? Date.parse(from) : toMs - 60 * MINUTE
    const stepMs = stepSeconds * 1000
    if (Number.isNaN(toMs) || Number.isNaN(fromMs) || fromMs > toMs || !(stepMs > 0)) {
      throw apiError('VALIDATION_ERROR', 400, 'Invalid from, to or step')
    }
    const series = generateSeries(profile, Math.ceil(fromMs / stepMs) * stepMs, aligned(toMs, stepMs), stepMs)
    return series.slice(-pageSize)
  })
}

/** GET /astronauts/:id/risk */
export function getRisk(id, ctx = {}) {
  return respond('risk', ctx, ({ now }) => generateRisk(findProfile(id), aligned(now, READING_INTERVAL_MS)))
}

/** GET /alerts?status=&severity= */
export function getAlerts({ status, severity } = {}, ctx = {}) {
  return respond('alerts', ctx, ({ now, empty }) => {
    if (empty) return []
    return buildAlerts(now).filter((a) => {
      if (status === 'open' && a.acknowledged) return false
      if (status === 'acknowledged' && !a.acknowledged) return false
      if (severity && a.severity !== severity) return false
      return true
    })
  })
}

/** POST /alerts/:id/acknowledge */
export function acknowledgeAlert(id, ctx = {}) {
  return respond('alerts', ctx, ({ now }) => {
    const alert = buildAlerts(now).find((a) => a.id === id)
    if (!alert) throw apiError('NOT_FOUND', 404, 'Alert not found. It may have cleared already.')
    acknowledged.add(id)
    return { ...alert, acknowledged: true }
  })
}
