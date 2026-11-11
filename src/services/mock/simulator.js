// Deterministic vital sign simulator.
// generateReading(profile, timeMs) is a pure function of its inputs: the same astronaut at the
// same moment always gives the same reading. That lets "latest" and "history" agree with each
// other and makes the simulator easy to test. Output matches VitalReading in docs/API_CONTRACT.md.

const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE

/** Deterministic pseudo-random number in [0, 1) for an integer-ish input. */
export function hash(n) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** Smooth noise in [-1, 1]. `t` moves by 1 per "noise step"; the value glides between random points. */
export function smoothNoise(t, seed) {
  const i = Math.floor(t)
  const f = t - i
  const a = hash(i + seed * 101)
  const b = hash(i + 1 + seed * 101)
  const u = (1 - Math.cos(f * Math.PI)) / 2
  return (a * (1 - u) + b * u) * 2 - 1
}

/** 0 to 1 strength of the repeating episode at a moment. Mostly near 0, with a rounded peak. */
export function episodeStrength(episode, timeMs) {
  if (!episode) return 0
  const angle = (2 * Math.PI * timeMs) / (episode.periodMin * MINUTE) + episode.phase
  return Math.pow(Math.max(0, Math.sin(angle)), 3)
}

const round = (v, d = 0) => {
  const f = 10 ** d
  return Math.round(v * f) / f
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/** ISO 8601 UTC with no milliseconds, as in the API contract. */
export function toContractTime(ms) {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/**
 * One VitalReading for one astronaut at one moment.
 * Time is rounded down to a whole second.
 */
export function generateReading(profile, timeMs) {
  const t = Math.floor(timeMs / 1000) * 1000
  const { base, seed, episode } = profile
  const strength = episodeStrength(episode, t)
  const fx = (key) => (episode?.effects?.[key] ?? 0) * strength

  // slow = changes over minutes, fast = changes every few seconds
  const slow = (k, size) => smoothNoise(t / (2 * MINUTE) + k * 7, seed * 10 + k) * size
  const fast = (k, size) => smoothNoise(t / 6000 + k * 13, seed * 10 + k + 50) * size

  const day = Math.floor(t / DAY)
  const sleep = base.sleepHours + smoothNoise(day, seed * 10 + 9) * 0.4
  const radiation = base.radiationDoseMsv + smoothNoise(day, seed * 10 + 8) * 0.08

  return {
    astronautId: profile.id,
    timestamp: toContractTime(t),
    heartRate: round(clamp(base.heartRate + fx('heartRate') + slow(1, 4) + fast(1, 1.5), 30, 220)),
    spo2: round(clamp(base.spo2 + fx('spo2') + slow(2, 0.8) + fast(2, 0.5), 60, 100)),
    respiratoryRate: round(clamp(base.respiratoryRate + fx('respiratoryRate') + slow(3, 1) + fast(3, 0.4), 4, 60)),
    bloodPressure: {
      systolic: round(clamp(base.systolic + fx('systolic') + slow(4, 3) + fast(4, 1), 60, 240)),
      diastolic: round(clamp(base.diastolic + fx('diastolic') + slow(5, 2) + fast(5, 0.8), 30, 150)),
    },
    bodyTemperatureC: round(clamp(base.bodyTemperatureC + fx('bodyTemperatureC') + slow(6, 0.1) + fast(6, 0.03), 33, 42), 1),
    stressIndex: round(clamp(base.stressIndex + fx('stressIndex') + slow(7, 3) + fast(7, 1), 0, 100)),
    sleepHours: round(clamp(sleep, 0, 14), 1),
    radiationDoseMsv: round(clamp(radiation, 0, 5), 2),
    source: 'simulated',
  }
}

/** Evenly spaced readings from fromMs to toMs (inclusive), `stepMs` apart, oldest first. */
export function generateSeries(profile, fromMs, toMs, stepMs) {
  const out = []
  if (!(stepMs > 0) || toMs < fromMs) return out
  for (let t = fromMs; t <= toMs; t += stepMs) out.push(generateReading(profile, t))
  return out
}
