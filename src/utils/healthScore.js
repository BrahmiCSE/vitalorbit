// Health score: a 0 to 100 display number (higher = healthier) calculated in the browser
// from one VitalReading. It is NOT the AI risk score (which comes from the API, higher = riskier).
//
// Method:
//   1. Each metric gets a penalty from 0 to 1.
//        inside the healthy range:  0 to 0.12, growing as the value moves away from the ideal
//        at the warning limit:      0.25
//        at the emergency limit:    0.75
//        beyond the emergency limit: rises toward 1
//   2. Score = 100 x (1 - sum of weight x penalty).
//   3. The score is capped so it always agrees with the status colours:
//        any emergency metric -> at most 45
//        any warning metric   -> at most 79
//      A reading with every metric healthy therefore scores 88 or higher.
import { STATUS } from '../constants/status.js'
import { VITAL_KEYS, VITAL_LIMITS, readMetric } from '../constants/vitals.js'
import { evaluateReading } from './vitalStatus.js'

export const SCORE_CAP_EMERGENCY = 45
export const SCORE_CAP_WARNING = 79

/** Penalty (0 to 1) for one metric value. Returns 0 for missing values. */
export function metricPenalty(key, value) {
  const lim = VITAL_LIMITS[key]
  if (!lim || typeof value !== 'number' || Number.isNaN(value)) return 0

  const high = value >= lim.ideal
  const warn = high ? lim.warnHigh : lim.warnLow
  const emergency = high ? lim.emergencyHigh : lim.emergencyLow
  if (warn === undefined) return 0 // no limit on this side of the ideal

  const span = Math.abs(warn - lim.ideal)
  const beyondWarn = high ? value - warn : warn - value

  if (beyondWarn <= 0) {
    if (span === 0) return 0
    const ratio = Math.abs(value - lim.ideal) / span
    return 0.12 * Math.min(1, ratio * ratio)
  }

  if (emergency === undefined) {
    return Math.min(0.6, 0.25 + 0.35 * (beyondWarn / span))
  }

  const width = Math.abs(warn - emergency)
  const beyondEmergency = high ? value - emergency : emergency - value
  if (beyondEmergency <= 0) return 0.25 + 0.5 * (beyondWarn / width)
  return Math.min(1, 0.75 + 0.25 * (beyondEmergency / width))
}

/** Integer score 0 to 100, or null when there is no reading. */
export function computeHealthScore(reading) {
  if (!reading) return null
  let loss = 0
  for (const key of VITAL_KEYS) {
    loss += VITAL_LIMITS[key].weight * metricPenalty(key, readMetric(reading, key))
  }
  let score = Math.round(100 * (1 - loss))

  const { overall } = evaluateReading(reading)
  if (overall === STATUS.EMERGENCY) score = Math.min(score, SCORE_CAP_EMERGENCY)
  else if (overall === STATUS.WARNING) score = Math.min(score, SCORE_CAP_WARNING)

  return Math.max(0, Math.min(100, score))
}
