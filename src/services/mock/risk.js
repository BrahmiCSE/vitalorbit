// Simulated "AI" risk assessment. This is rule-based code standing in for the scikit-learn model
// the backend will provide later. Output matches RiskAssessment in docs/API_CONTRACT.md,
// including the optional `anomalies` list.
import { STATUS } from '../../constants/status.js'
import { VITAL_KEYS, VITAL_LIMITS, readMetric } from '../../constants/vitals.js'
import { evaluateReading, describeRange, formatWithUnit } from '../../utils/vitalStatus.js'
import { computeHealthScore } from '../../utils/healthScore.js'
import { generateReading, toContractTime } from './simulator.js'

const MINUTE = 60 * 1000
const TREND_WINDOW_MIN = 15

// Early-warning rules: a fast change is flagged even while the value is still in range.
const TREND_RULES = [
  { key: 'heartRate', delta: 15, direction: 'rise' },
  { key: 'spo2', delta: 3, direction: 'fall' },
  { key: 'stressIndex', delta: 15, direction: 'rise' },
]

const EXPLANATIONS = {
  heartRate: {
    low: 'Heart rate is below the resting range. This can follow recovery from heavy exertion, or point to a rhythm problem, so a manual check is sensible.',
    high: 'Heart rate is above the resting range. In the simulation this usually goes with stress, exertion or falling oxygen saturation.',
  },
  spo2: {
    low: 'Blood oxygen saturation is below the expected range. Less oxygen reaches the body, which can also raise heart rate and breathing rate.',
  },
  respiratoryRate: {
    low: 'Breathing is slower than expected. Check responsiveness and cabin air quality.',
    high: 'Breathing is faster than expected. This often accompanies stress, exertion or low oxygen saturation.',
  },
  systolic: {
    low: 'Systolic blood pressure is low. In microgravity, fluid shifts can cause this. Dizziness is a symptom to ask about.',
    high: 'Systolic blood pressure is high. Stress and sustained exertion are common causes in the simulation.',
  },
  diastolic: {
    low: 'Diastolic blood pressure is low. Compare with the systolic value and recent activity.',
    high: 'Diastolic blood pressure is high. Compare with the systolic value and recent stress readings.',
  },
  bodyTemperatureC: {
    low: 'Body temperature is below the expected range. Check suit and cabin temperature settings.',
    high: 'Body temperature is above the expected range. This can come from exertion, a thermal control issue or illness.',
  },
  stressIndex: {
    high: 'The stress index is high. It combines heart rate variability and activity, and sustained high values can affect sleep and performance.',
  },
  sleepHours: {
    low: 'Last night’s sleep was shorter than the target. Short sleep over several days affects alertness and recovery.',
  },
}

const TREND_EXPLANATIONS = {
  heartRate: `Heart rate has risen quickly over the last ${TREND_WINDOW_MIN} minutes. It is still in range, but the rate of change is unusual.`,
  spo2: `Oxygen saturation has been falling over the last ${TREND_WINDOW_MIN} minutes and is heading toward the warning limit.`,
  stressIndex: `Stress has climbed quickly over the last ${TREND_WINDOW_MIN} minutes. It is still in range, but the rate of change is unusual.`,
}

function side(key, value) {
  const l = VITAL_LIMITS[key]
  return l.warnLow !== undefined && value < l.warnLow ? 'low' : 'high'
}

/** Anomalies in one reading, plus early-warning trends against an earlier reading. */
export function detectAnomalies(reading, earlier) {
  const { metrics } = evaluateReading(reading)
  const anomalies = []

  for (const key of VITAL_KEYS) {
    const status = metrics[key]
    if (status !== STATUS.WARNING && status !== STATUS.EMERGENCY) continue
    const value = readMetric(reading, key)
    anomalies.push({
      metric: key,
      label: VITAL_LIMITS[key].label,
      kind: 'threshold',
      severity: status,
      observed: value,
      unit: VITAL_LIMITS[key].unit,
      expected: describeRange(key),
      explanation: EXPLANATIONS[key][side(key, value)],
    })
  }

  if (earlier) {
    for (const rule of TREND_RULES) {
      if (metrics[rule.key] !== STATUS.HEALTHY) continue // already flagged above
      const now = readMetric(reading, rule.key)
      const before = readMetric(earlier, rule.key)
      const change = rule.direction === 'rise' ? now - before : before - now
      if (change < rule.delta) continue
      anomalies.push({
        metric: rule.key,
        label: VITAL_LIMITS[rule.key].label,
        kind: 'trend',
        severity: 'info',
        observed: now,
        unit: VITAL_LIMITS[rule.key].unit,
        expected: describeRange(rule.key),
        explanation: TREND_EXPLANATIONS[rule.key],
      })
    }
  }

  const rank = { emergency: 0, warning: 1, info: 2 }
  return anomalies.sort((a, b) => rank[a.severity] - rank[b.severity])
}

function levelFor(score, anomalies) {
  let level = score < 20 ? 'low' : score < 40 ? 'moderate' : score < 60 ? 'high' : 'critical'
  if (anomalies.some((a) => a.severity === 'emergency')) level = 'critical'
  else if (anomalies.some((a) => a.severity === 'warning') && level === 'low') level = 'moderate'
  return level
}

/** RiskAssessment for one astronaut at one moment. */
export function generateRisk(profile, nowMs) {
  const reading = generateReading(profile, nowMs)
  const earlier = generateReading(profile, nowMs - TREND_WINDOW_MIN * MINUTE)
  const anomalies = detectAnomalies(reading, earlier)
  const trendCount = anomalies.filter((a) => a.kind === 'trend').length

  const health = computeHealthScore(reading)
  const score = Math.max(0, Math.min(100, 100 - health + 3 * trendCount))
  const riskLevel = levelFor(score, anomalies)

  const top = anomalies[0]
  const summary = top
    ? `${anomalies.length} ${anomalies.length === 1 ? 'anomaly' : 'anomalies'} detected. Highest concern: ${top.label} at ${formatWithUnit(top.observed, top.unit)}${top.kind === 'trend' ? ' and changing quickly' : ` (expected ${top.expected})`}. Overall risk is ${riskLevel}.`
    : 'All monitored vitals are within their normal ranges and no unusual trends were found.'

  const factors = anomalies.map((a) =>
    a.kind === 'trend'
      ? `${a.label} changing quickly (${formatWithUnit(a.observed, a.unit)})`
      : `${a.label} ${formatWithUnit(a.observed, a.unit)}, expected ${a.expected}`,
  )

  return {
    astronautId: profile.id,
    riskLevel,
    score,
    summary,
    factors,
    anomalies,
    generatedAt: toContractTime(nowMs),
  }
}
