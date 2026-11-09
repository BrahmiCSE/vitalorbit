import test from 'node:test'
import assert from 'node:assert/strict'
import { computeHealthScore, metricPenalty, SCORE_CAP_EMERGENCY, SCORE_CAP_WARNING } from './healthScore.js'
import { VITAL_LIMITS } from '../constants/vitals.js'

const ideal = {
  heartRate: 65, spo2: 98, respiratoryRate: 15,
  bloodPressure: { systolic: 115, diastolic: 75 },
  bodyTemperatureC: 36.8, stressIndex: 20, sleepHours: 7.5,
}

test('weights add up to 1', () => {
  const total = Object.values(VITAL_LIMITS).reduce((sum, l) => sum + l.weight, 0)
  assert.ok(Math.abs(total - 1) < 1e-9, `weights sum to ${total}`)
})

test('an ideal reading scores 100', () => {
  assert.equal(computeHealthScore(ideal), 100)
})

test('no reading gives null', () => {
  assert.equal(computeHealthScore(null), null)
  assert.equal(computeHealthScore(undefined), null)
})

test('a healthy but imperfect reading stays at 88 or above', () => {
  // Every value sits on the edge of its healthy range.
  const edge = {
    heartRate: 100, spo2: 95, respiratoryRate: 20,
    bloodPressure: { systolic: 140, diastolic: 90 },
    bodyTemperatureC: 37.8, stressIndex: 60, sleepHours: 6,
  }
  const score = computeHealthScore(edge)
  assert.ok(score >= 88 && score <= 100, `score was ${score}`)
})

test('any warning caps the score at 79', () => {
  const score = computeHealthScore({ ...ideal, spo2: 93 })
  assert.ok(score <= SCORE_CAP_WARNING, `score was ${score}`)
  assert.ok(score > SCORE_CAP_EMERGENCY, `score was ${score}`)
})

test('any emergency caps the score at 45', () => {
  const score = computeHealthScore({ ...ideal, spo2: 85 })
  assert.ok(score <= SCORE_CAP_EMERGENCY, `score was ${score}`)
})

test('score never leaves 0 to 100, even with extreme values', () => {
  const awful = {
    heartRate: 300, spo2: 40, respiratoryRate: 80,
    bloodPressure: { systolic: 300, diastolic: 200 },
    bodyTemperatureC: 45, stressIndex: 100, sleepHours: 0,
  }
  const score = computeHealthScore(awful)
  assert.ok(Number.isInteger(score))
  assert.ok(score >= 0 && score <= 45, `score was ${score}`)
})

test('worse vitals never score higher than better ones', () => {
  const values = [98, 96, 94, 92, 90, 88, 80]
  const scores = values.map((spo2) => computeHealthScore({ ...ideal, spo2 }))
  for (let i = 1; i < scores.length; i++) assert.ok(scores[i] <= scores[i - 1], scores.join(','))
})

test('metricPenalty is 0 for missing values and grows past the limits', () => {
  assert.equal(metricPenalty('heartRate', undefined), 0)
  assert.equal(metricPenalty('heartRate', 65), 0)
  const atWarn = metricPenalty('heartRate', 101)
  const atEmergency = metricPenalty('heartRate', 131)
  assert.ok(atWarn >= 0.25 && atWarn < 0.3, `warn penalty ${atWarn}`)
  assert.ok(atEmergency >= 0.75, `emergency penalty ${atEmergency}`)
  assert.ok(metricPenalty('heartRate', 400) <= 1)
})

test('a metric is not penalised on a side that has no limit', () => {
  assert.equal(metricPenalty('spo2', 100), 0)
  assert.equal(metricPenalty('stressIndex', 0), 0)
  assert.equal(metricPenalty('sleepHours', 11), 0)
})
