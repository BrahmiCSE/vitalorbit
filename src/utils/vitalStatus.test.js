import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateMetric, evaluateReading, worstStatus, bloodPressureStatus } from './vitalStatus.js'

const healthyReading = {
  heartRate: 70, spo2: 98, respiratoryRate: 15,
  bloodPressure: { systolic: 118, diastolic: 76 },
  bodyTemperatureC: 36.8, stressIndex: 20, sleepHours: 7.5,
}

test('worstStatus picks the most serious and ignores empty values', () => {
  assert.equal(worstStatus(['healthy', 'warning']), 'warning')
  assert.equal(worstStatus(['healthy', 'emergency', 'warning']), 'emergency')
  assert.equal(worstStatus([null, undefined]), null)
  assert.equal(worstStatus([]), null)
})

test('evaluateMetric treats a value exactly on a limit as inside the range', () => {
  assert.equal(evaluateMetric('spo2', 95), 'healthy')
  assert.equal(evaluateMetric('spo2', 94), 'warning')
  assert.equal(evaluateMetric('spo2', 90), 'warning')
  assert.equal(evaluateMetric('spo2', 89), 'emergency')
  assert.equal(evaluateMetric('heartRate', 100), 'healthy')
  assert.equal(evaluateMetric('heartRate', 101), 'warning')
  assert.equal(evaluateMetric('heartRate', 131), 'emergency')
  assert.equal(evaluateMetric('heartRate', 39), 'emergency')
})

test('one-sided metrics only react on their own side', () => {
  assert.equal(evaluateMetric('spo2', 100), 'healthy')
  assert.equal(evaluateMetric('stressIndex', 0), 'healthy')
  assert.equal(evaluateMetric('stressIndex', 61), 'warning')
  assert.equal(evaluateMetric('sleepHours', 12), 'healthy')
})

test('sleep never becomes an emergency', () => {
  assert.equal(evaluateMetric('sleepHours', 5.9), 'warning')
  assert.equal(evaluateMetric('sleepHours', 0), 'warning')
})

test('missing or invalid values return null', () => {
  assert.equal(evaluateMetric('heartRate', undefined), null)
  assert.equal(evaluateMetric('heartRate', NaN), null)
  assert.equal(evaluateMetric('heartRate', '72'), null)
  assert.equal(evaluateMetric('nonsense', 5), null)
})

test('evaluateReading gives per-metric and overall status', () => {
  const ok = evaluateReading(healthyReading)
  assert.equal(ok.overall, 'healthy')
  assert.equal(ok.metrics.systolic, 'healthy')

  const bad = evaluateReading({ ...healthyReading, spo2: 92, heartRate: 140 })
  assert.equal(bad.metrics.spo2, 'warning')
  assert.equal(bad.metrics.heartRate, 'emergency')
  assert.equal(bad.overall, 'emergency')
})

test('evaluateReading handles a missing reading and a partial reading', () => {
  assert.equal(evaluateReading(null).overall, null)
  const partial = evaluateReading({ heartRate: 70 })
  assert.equal(partial.overall, 'healthy')
  assert.equal(partial.metrics.spo2, null)
})

test('bloodPressureStatus takes the worse of systolic and diastolic', () => {
  assert.equal(bloodPressureStatus(healthyReading), 'healthy')
  assert.equal(bloodPressureStatus({ bloodPressure: { systolic: 120, diastolic: 95 } }), 'warning')
  assert.equal(bloodPressureStatus({ bloodPressure: { systolic: 185, diastolic: 80 } }), 'emergency')
})

test('describeRange wording', async () => {
  const { describeRange, describeRangeValues } = await import('./vitalStatus.js')
  assert.equal(describeRange('heartRate'), '50 to 100 bpm')
  assert.equal(describeRange('spo2'), '95 % or higher')
  assert.equal(describeRange('stressIndex'), '60 or lower')
  assert.equal(describeRange('bodyTemperatureC'), '36 to 37.8 \u00B0C')
  assert.equal(describeRangeValues('systolic'), '90 to 140')
  assert.equal(describeRange('unknown'), '')
  const { formatWithUnit } = await import('./vitalStatus.js')
  assert.equal(formatWithUnit(66, ''), '66')
  assert.equal(formatWithUnit(89, '%'), '89 %')
  assert.equal(formatWithUnit(93, 'bpm'), '93 bpm')
})
