import test from 'node:test'
import assert from 'node:assert/strict'
import { MOCK_CREW } from './crew.js'
import { generateReading, generateSeries, toContractTime } from './simulator.js'
import { generateRisk, detectAnomalies } from './risk.js'
import * as api from './mockApi.js'
import { evaluateReading } from '../../utils/vitalStatus.js'

const NOW = Date.parse('2026-11-09T18:00:00Z')
const ctx = (extra = {}) => ({ now: NOW, latencyMs: 0, sim: { mode: 'none', targets: null }, ...extra })

test('readings are deterministic and match the contract shape', () => {
  const p = MOCK_CREW[0]
  const a = generateReading(p, NOW)
  const b = generateReading(p, NOW + 400) // same second
  assert.deepEqual(a, b)
  assert.equal(a.astronautId, 'ast_001')
  assert.equal(a.source, 'simulated')
  assert.match(a.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
  for (const k of ['heartRate', 'spo2', 'respiratoryRate', 'bodyTemperatureC', 'stressIndex', 'sleepHours', 'radiationDoseMsv']) {
    assert.equal(typeof a[k], 'number', k)
    assert.ok(Number.isFinite(a[k]), k)
  }
  assert.equal(typeof a.bloodPressure.systolic, 'number')
  assert.equal(typeof a.bloodPressure.diastolic, 'number')
})

test('readings change from one 5 second poll to the next', () => {
  const p = MOCK_CREW[1]
  const seen = new Set()
  for (let i = 0; i < 12; i++) seen.add(JSON.stringify(generateReading(p, NOW + i * 5000)))
  assert.ok(seen.size > 6, `only ${seen.size} distinct readings`)
})

test('values stay inside physical bounds across a full day for every astronaut', () => {
  for (const p of MOCK_CREW) {
    for (const r of generateSeries(p, NOW - 24 * 3600e3, NOW, 60e3)) {
      assert.ok(r.spo2 <= 100 && r.spo2 >= 60, `spo2 ${r.spo2}`)
      assert.ok(r.heartRate >= 30 && r.heartRate <= 220, `hr ${r.heartRate}`)
      assert.ok(r.stressIndex >= 0 && r.stressIndex <= 100, `stress ${r.stressIndex}`)
      assert.ok(r.sleepHours >= 0 && r.sleepHours <= 14, `sleep ${r.sleepHours}`)
    }
  }
})

test('generateSeries is ordered, evenly spaced and handles bad input', () => {
  const s = generateSeries(MOCK_CREW[0], NOW - 600e3, NOW, 60e3)
  assert.equal(s.length, 11)
  assert.ok(Date.parse(s[1].timestamp) - Date.parse(s[0].timestamp) === 60e3)
  assert.deepEqual(generateSeries(MOCK_CREW[0], NOW, NOW - 1000, 60e3), [])
  assert.deepEqual(generateSeries(MOCK_CREW[0], NOW - 1000, NOW, 0), [])
})

test('the demo crew can reach all three statuses', () => {
  const seen = new Set()
  for (const p of MOCK_CREW) {
    for (const r of generateSeries(p, NOW - 24 * 3600e3, NOW, 60e3)) seen.add(evaluateReading(r).overall)
  }
  assert.deepEqual([...seen].sort(), ['emergency', 'healthy', 'warning'])
})

test('toContractTime drops milliseconds', () => {
  assert.equal(toContractTime(Date.parse('2026-11-09T11:00:00.789Z')), '2026-11-09T11:00:00Z')
})

test('getAstronauts returns the contract shape with derived status', async () => {
  const list = await api.getAstronauts(ctx())
  assert.equal(list.length, MOCK_CREW.length)
  for (const a of list) {
    assert.deepEqual(Object.keys(a).sort(), ['id', 'lastUpdated', 'name', 'role', 'status'])
    assert.ok(['healthy', 'warning', 'emergency'].includes(a.status))
  }
})

test('getLatestVitals, getRisk and getVitalsHistory reject unknown astronauts with NOT_FOUND', async () => {
  for (const call of [
    () => api.getLatestVitals('ast_999', ctx()),
    () => api.getRisk('ast_999', ctx()),
    () => api.getVitalsHistory('ast_999', {}, ctx()),
  ]) {
    await assert.rejects(call, (e) => e.code === 'NOT_FOUND' && e.status === 404)
  }
})

test('getVitalsHistory returns ordered readings, honours step and pageSize, validates input', async () => {
  const hour = await api.getVitalsHistory('ast_001', {
    from: new Date(NOW - 3600e3).toISOString(), to: new Date(NOW).toISOString(), stepSeconds: 60,
  }, ctx())
  assert.equal(hour.length, 61)
  assert.ok(Date.parse(hour.at(-1).timestamp) <= NOW)

  const capped = await api.getVitalsHistory('ast_001', { stepSeconds: 60, pageSize: 10 }, ctx())
  assert.equal(capped.length, 10)

  await assert.rejects(
    api.getVitalsHistory('ast_001', { from: 'garbage' }, ctx()),
    (e) => e.code === 'VALIDATION_ERROR' && e.status === 400,
  )
  await assert.rejects(
    api.getVitalsHistory('ast_001', { from: new Date(NOW).toISOString(), to: new Date(NOW - 1000).toISOString() }, ctx()),
    (e) => e.code === 'VALIDATION_ERROR',
  )
})

test('history and latest agree with each other', async () => {
  const latest = await api.getLatestVitals('ast_004', ctx())
  const [last] = (await api.getVitalsHistory('ast_004', {
    from: latest.timestamp, to: latest.timestamp, stepSeconds: 5,
  }, ctx())).slice(-1)
  assert.deepEqual(last, latest)
})

test('risk assessment matches the contract and its parts are consistent', () => {
  for (const p of MOCK_CREW) {
    for (const r of generateSeries(p, NOW - 6 * 3600e3, NOW, 5 * 60e3)) {
      const risk = generateRisk(p, Date.parse(r.timestamp))
      assert.ok(['low', 'moderate', 'high', 'critical'].includes(risk.riskLevel))
      assert.ok(Number.isInteger(risk.score) && risk.score >= 0 && risk.score <= 100)
      assert.equal(risk.factors.length, risk.anomalies.length)
      assert.equal(typeof risk.summary, 'string')
      if (risk.anomalies.some((a) => a.severity === 'emergency')) assert.equal(risk.riskLevel, 'critical')
      if (risk.anomalies.some((a) => a.severity === 'warning')) assert.notEqual(risk.riskLevel, 'low')
      for (const a of risk.anomalies) assert.ok(a.explanation && a.expected && a.label)
    }
  }
})

test('a healthy reading with no trend produces no anomalies', () => {
  const reading = {
    heartRate: 65, spo2: 98, respiratoryRate: 15, bloodPressure: { systolic: 115, diastolic: 75 },
    bodyTemperatureC: 36.8, stressIndex: 20, sleepHours: 7.5,
  }
  assert.deepEqual(detectAnomalies(reading, reading), [])
})

test('trend rules flag a fast fall in SpO2 that is still in range', () => {
  const earlier = { heartRate: 65, spo2: 99, respiratoryRate: 15, bloodPressure: { systolic: 115, diastolic: 75 }, bodyTemperatureC: 36.8, stressIndex: 20, sleepHours: 7.5 }
  const now = { ...earlier, spo2: 96 }
  const found = detectAnomalies(now, earlier)
  assert.equal(found.length, 1)
  assert.equal(found[0].kind, 'trend')
  assert.equal(found[0].severity, 'info')
  assert.equal(found[0].metric, 'spo2')
})

test('alerts: stable ids across polls, severity filter, acknowledge flow', async () => {
  api.resetMockState()
  const first = await api.getAlerts({}, ctx())
  const again = await api.getAlerts({}, ctx({ now: NOW + 5000 }))
  const ids = (list) => list.map((a) => a.id).sort()
  assert.deepEqual(ids(first), ids(again), 'ids should not change between nearby polls')
  assert.ok(first.some((a) => a.severity === 'info'))
  for (const a of first) {
    assert.deepEqual(Object.keys(a).sort(), ['acknowledged', 'astronautId', 'createdAt', 'id', 'message', 'severity'])
    assert.ok(Date.parse(a.createdAt) <= NOW)
  }

  const onlyInfo = await api.getAlerts({ severity: 'info' }, ctx())
  assert.ok(onlyInfo.length >= 1 && onlyInfo.every((a) => a.severity === 'info'))

  const target = first[0]
  const done = await api.acknowledgeAlert(target.id, ctx())
  assert.equal(done.acknowledged, true)
  const open = await api.getAlerts({ status: 'open' }, ctx())
  assert.ok(!open.some((a) => a.id === target.id))
  const acked = await api.getAlerts({ status: 'acknowledged' }, ctx())
  assert.ok(acked.some((a) => a.id === target.id))

  await assert.rejects(api.acknowledgeAlert('alt_nope', ctx()), (e) => e.code === 'NOT_FOUND')
  api.resetMockState()
})

test('simulation switches: error, targeted error, empty', async () => {
  assert.deepEqual(api.parseSimMode('?sim=error'), { mode: 'error', targets: null })
  assert.equal(api.parseSimMode('?sim=bogus').mode, 'none')
  assert.equal(api.parseSimMode('').mode, 'none')
  const targeted = api.parseSimMode('?sim=error:risk,alerts')
  assert.deepEqual([...targeted.targets], ['risk', 'alerts'])

  await assert.rejects(api.getMission(ctx({ sim: { mode: 'error', targets: null } })), (e) => e.code === 'INTERNAL_ERROR')
  const only = { mode: 'error', targets: new Set(['risk']) }
  await assert.rejects(api.getRisk('ast_001', ctx({ sim: only })), (e) => e.status === 500)
  assert.equal((await api.getAstronauts(ctx({ sim: only }))).length, MOCK_CREW.length)

  const empty = { mode: 'empty', targets: null }
  assert.deepEqual(await api.getAstronauts(ctx({ sim: empty })), [])
  assert.deepEqual(await api.getAlerts({}, ctx({ sim: empty })), [])
})

test('alert ids stay the same while a condition lasts (no id churn between polls)', async () => {
  api.resetMockState()
  const start = Date.parse('2026-11-09T18:00:00Z')
  let previous = null
  let checkedPairs = 0
  const createdAtById = new Map()
  for (let t = start; t < start + 3 * 3600e3; t += 5000) {
    const list = await api.getAlerts({}, ctx({ now: t }))
    for (const a of list) {
      // createdAt never changes for an id, and is never in the future
      if (createdAtById.has(a.id)) assert.equal(createdAtById.get(a.id), a.createdAt, `createdAt changed for ${a.id}`)
      else createdAtById.set(a.id, a.createdAt)
      assert.ok(Date.parse(a.createdAt) <= t, `createdAt ${a.createdAt} is after ${new Date(t).toISOString()}`)
    }
    if (previous) {
      // Same astronaut, metric and severity in two polls 5 seconds apart must share one id.
      const keyOf = (a) => a.id.split('_').slice(0, 5).join('_') // alt_ast_004_<metric>_<severity>
      const prevByKey = new Map(previous.map((a) => [keyOf(a), a.id]))
      for (const a of list) {
        if (prevByKey.has(keyOf(a))) {
          assert.equal(prevByKey.get(keyOf(a)), a.id, `id changed between polls for ${keyOf(a)}`)
          checkedPairs++
        }
      }
    }
    previous = list
  }
  assert.ok(checkedPairs > 100, `only ${checkedPairs} consecutive pairs were compared`)
  assert.ok(createdAtById.size > 3)
})

test('an acknowledged alert stays acknowledged for the whole episode', async () => {
  api.resetMockState()
  const t0 = Date.parse('2026-11-09T20:07:30Z') // spo2 emergency for ast_004
  const first = (await api.getAlerts({ status: 'open' }, ctx({ now: t0 }))).find((a) => a.severity === 'emergency')
  assert.ok(first, 'expected an emergency alert at this moment')
  await api.acknowledgeAlert(first.id, ctx({ now: t0 }))
  for (let t = t0; t < t0 + 120e3; t += 5000) {
    const open = await api.getAlerts({ status: 'open' }, ctx({ now: t }))
    assert.ok(!open.some((a) => a.id === first.id), `acknowledged alert reappeared at ${new Date(t).toISOString()}`)
  }
  api.resetMockState()
})
