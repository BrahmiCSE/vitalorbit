// Pure helpers that turn vital readings into healthy / warning / emergency.
// Limits come from constants/vitals.js. A value exactly on a limit is still inside the range.
import { STATUS } from '../constants/status.js'
import { VITAL_KEYS, VITAL_LIMITS, readMetric } from '../constants/vitals.js'

const RANK = { [STATUS.HEALTHY]: 0, [STATUS.WARNING]: 1, [STATUS.EMERGENCY]: 2 }

/** Most serious status in a list. Ignores null/undefined. Returns null if nothing usable. */
export function worstStatus(statuses) {
  let worst = null
  for (const s of statuses) {
    if (s == null || !(s in RANK)) continue
    if (worst === null || RANK[s] > RANK[worst]) worst = s
  }
  return worst
}

/** Status of one metric value. Returns null when the value is missing or not a number. */
export function evaluateMetric(key, value) {
  const lim = VITAL_LIMITS[key]
  if (!lim || typeof value !== 'number' || Number.isNaN(value)) return null
  if (
    (lim.emergencyLow !== undefined && value < lim.emergencyLow) ||
    (lim.emergencyHigh !== undefined && value > lim.emergencyHigh)
  ) return STATUS.EMERGENCY
  if (
    (lim.warnLow !== undefined && value < lim.warnLow) ||
    (lim.warnHigh !== undefined && value > lim.warnHigh)
  ) return STATUS.WARNING
  return STATUS.HEALTHY
}

/**
 * Status of every metric in a VitalReading plus the overall (worst) status.
 * Returns { metrics: { heartRate: 'healthy', ... }, overall }.
 * overall is null when there is no reading.
 */
export function evaluateReading(reading) {
  const metrics = {}
  for (const key of VITAL_KEYS) metrics[key] = evaluateMetric(key, readMetric(reading, key))
  return { metrics, overall: reading ? worstStatus(Object.values(metrics)) : null }
}

/** Blood pressure shows as one tile, so it takes the worse of its two numbers. */
export function bloodPressureStatus(reading) {
  const { metrics } = evaluateReading(reading)
  return worstStatus([metrics.systolic, metrics.diastolic])
}

/** Normal range without the unit, e.g. "50 to 100" or "95 or higher". */
export function describeRangeValues(key) {
  const l = VITAL_LIMITS[key]
  if (!l) return ''
  if (l.warnLow !== undefined && l.warnHigh !== undefined) return `${l.warnLow} to ${l.warnHigh}`
  if (l.warnLow !== undefined) return `${l.warnLow} or higher`
  return `${l.warnHigh} or lower`
}

/** "93 bpm", "89 %", or just "66" when the metric has no unit. */
export function formatWithUnit(value, unit) {
  if (!unit) return `${value}`
  return unit === '%' ? `${value} %` : `${value} ${unit}`
}

/** Normal range with the unit, e.g. "50 to 100 bpm", "95 % or higher" or "60 or lower". */
export function describeRange(key) {
  const l = VITAL_LIMITS[key]
  if (!l) return ''
  if (l.warnLow !== undefined && l.warnHigh !== undefined) return `${formatWithUnit(`${l.warnLow} to ${l.warnHigh}`, l.unit)}`
  if (l.warnLow !== undefined) return `${formatWithUnit(l.warnLow, l.unit)} or higher`
  return `${formatWithUnit(l.warnHigh, l.unit)} or lower`
}
