import test from 'node:test'
import assert from 'node:assert/strict'
import { getMissionDay, getMissionLengthDays, getMissionProgress } from './mission.js'
import { formatNumber, formatTimeAgo, formatClockUtc, formatDateUtc } from './format.js'

const LAUNCH = '2026-09-10T00:00:00Z'
const END = '2027-03-09T00:00:00Z'

test('launch day is mission day 1', () => {
  assert.equal(getMissionDay(LAUNCH, Date.parse('2026-09-10T00:00:00Z')), 1)
  assert.equal(getMissionDay(LAUNCH, Date.parse('2026-09-10T23:59:59Z')), 1)
  assert.equal(getMissionDay(LAUNCH, Date.parse('2026-09-11T00:00:00Z')), 2)
})

test('mission day is 0 before launch and for invalid dates', () => {
  assert.equal(getMissionDay(LAUNCH, Date.parse('2026-09-09T23:59:59Z')), 0)
  assert.equal(getMissionDay('not a date', Date.now()), 0)
})

test('mission length and progress', () => {
  assert.equal(getMissionLengthDays(LAUNCH, END), 180)
  assert.equal(getMissionLengthDays(END, LAUNCH), 0)
  assert.equal(getMissionProgress(LAUNCH, END, Date.parse(LAUNCH)), 0)
  assert.equal(getMissionProgress(LAUNCH, END, Date.parse(END)), 1)
  assert.equal(getMissionProgress(LAUNCH, END, Date.parse('2030-01-01T00:00:00Z')), 1)
  assert.equal(getMissionProgress(LAUNCH, END, Date.parse('2020-01-01T00:00:00Z')), 0)
  assert.equal(getMissionProgress('bad', END, Date.now()), 0)
  const half = getMissionProgress(LAUNCH, END, Date.parse('2026-12-09T00:00:00Z'))
  assert.ok(half > 0.49 && half < 0.51, `half was ${half}`)
})

test('formatNumber', () => {
  assert.equal(formatNumber(72), '72')
  assert.equal(formatNumber(36.74, 1), '36.7')
  assert.equal(formatNumber(undefined), '--')
  assert.equal(formatNumber(NaN), '--')
})

test('formatTimeAgo', () => {
  const now = Date.parse('2026-11-09T12:00:00Z')
  assert.equal(formatTimeAgo('2026-11-09T11:59:40Z', now), 'just now')
  assert.equal(formatTimeAgo('2026-11-09T11:55:00Z', now), '5 min ago')
  assert.equal(formatTimeAgo('2026-11-09T09:00:00Z', now), '3 h ago')
  assert.equal(formatTimeAgo('2026-11-06T12:00:00Z', now), '3 d ago')
  assert.equal(formatTimeAgo('garbage', now), '--')
  assert.equal(formatTimeAgo('2026-11-09T12:05:00Z', now), 'just now') // clock skew: future time
})

test('formatClockUtc and formatDateUtc', () => {
  assert.equal(formatClockUtc(Date.parse('2026-11-09T14:05:09Z')), '14:05:09 UTC')
  assert.equal(formatDateUtc('2026-09-10T00:00:00Z'), '10 Sep 2026')
  assert.equal(formatDateUtc('nope'), '--')
})

test('initials', async () => {
  const { initials } = await import('./format.js')
  assert.equal(initials('Cmdr. A. Rivera'), 'AR')
  assert.equal(initials('Dr. N. Okafor'), 'NO')
  assert.equal(initials('Madonna'), 'MA')
  assert.equal(initials(''), '--')
})
