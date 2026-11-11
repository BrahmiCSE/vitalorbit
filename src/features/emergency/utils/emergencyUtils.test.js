import test from 'node:test'
import assert from 'node:assert/strict'
import { classifySeverity, formatReading, buildIncident } from './emergencyUtils.js'

 test('classifies healthy, warning and emergency values for high-direction scenarios', () => {
  assert.equal(classifySeverity(74, 74, 132), 'healthy')
  assert.equal(classifySeverity(103, 74, 132), 'warning')
  assert.equal(classifySeverity(132, 74, 132), 'emergency')
})

test('classifies low-direction scenarios correctly', () => {
  assert.equal(classifySeverity(98, 98, 89, 'low'), 'healthy')
  assert.equal(classifySeverity(93, 98, 89, 'low'), 'warning')
  assert.equal(classifySeverity(89, 98, 89, 'low'), 'emergency')
})

test('formats readings with units', () => {
  assert.equal(formatReading(72, 'bpm'), '72 bpm')
  assert.equal(formatReading(36.7, '°C'), '36.7 °C')
})

test('builds a clearly simulated incident record', () => {
  const scenario = { id: 'demo', title: 'Demo', unit: 'bpm' }
  const incident = buildIncident({ scenario, finalValue: 90, outcome: 'recovered', startedAt: '2026-11-11T10:00:00Z' })
  assert.equal(incident.scenarioId, 'demo')
  assert.equal(incident.simulated, true)
  assert.equal(incident.outcome, 'recovered')
})

import { EMERGENCY_SCENARIOS } from '../data/emergencyScenarios.js'
test('all six scenarios define explicit direction and recovery progression toward baseline', () => {
  assert.equal(EMERGENCY_SCENARIOS.length, 6)
  for (const scenario of EMERGENCY_SCENARIOS) {
    assert.ok(['high', 'low'].includes(scenario.direction))
    assert.ok(Number.isFinite(scenario.recoveryStep))
    const next = scenario.abnormal + scenario.recoveryStep * 0.45
    assert.ok(Math.abs(next - scenario.baseline) < Math.abs(scenario.abnormal - scenario.baseline))
    assert.ok(scenario.protocol.length >= 4)
  }
})
