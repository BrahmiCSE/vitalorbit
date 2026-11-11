// Vital sign limits and display metadata. Single source of truth for the dashboard.
// Values are simulated reference ranges for the demo build. They are NOT clinical guidance.
//
// How limits work, per metric:
//   value below warnLow  (or above warnHigh)      -> "warning"
//   value below emergencyLow (or above emergencyHigh) -> "emergency"
//   a limit that is undefined does not apply on that side (for example sleep has no upper limit)
//   ideal  = the value used as the centre of the healthy range for the health score
//   weight = share of the health score (all weights add up to 1)
//
// Plain relative imports with explicit extensions are used in constants, utils and
// services/mock so that Node's built-in test runner can load them without Vite.

export const VITAL_KEYS = [
  'heartRate',
  'spo2',
  'respiratoryRate',
  'systolic',
  'diastolic',
  'bodyTemperatureC',
  'stressIndex',
  'sleepHours',
]

export const VITAL_LIMITS = {
  heartRate: {
    label: 'Heart rate', unit: 'bpm', decimals: 0, ideal: 65, weight: 0.2,
    warnLow: 50, warnHigh: 100, emergencyLow: 40, emergencyHigh: 130,
  },
  spo2: {
    label: 'SpO2', unit: '%', decimals: 0, ideal: 98, weight: 0.25,
    warnLow: 95, emergencyLow: 90,
  },
  respiratoryRate: {
    label: 'Respiration', unit: 'br/min', decimals: 0, ideal: 15, weight: 0.1,
    warnLow: 12, warnHigh: 20, emergencyLow: 8, emergencyHigh: 30,
  },
  systolic: {
    label: 'Systolic pressure', unit: 'mmHg', decimals: 0, ideal: 115, weight: 0.08,
    warnLow: 90, warnHigh: 140, emergencyLow: 80, emergencyHigh: 180,
  },
  diastolic: {
    label: 'Diastolic pressure', unit: 'mmHg', decimals: 0, ideal: 75, weight: 0.07,
    warnLow: 60, warnHigh: 90, emergencyLow: 50, emergencyHigh: 120,
  },
  bodyTemperatureC: {
    label: 'Body temperature', unit: '°C', decimals: 1, ideal: 36.8, weight: 0.1,
    warnLow: 36.0, warnHigh: 37.8, emergencyLow: 35.0, emergencyHigh: 39.0,
  },
  stressIndex: {
    label: 'Stress index', unit: '', decimals: 0, ideal: 20, weight: 0.1,
    warnHigh: 60, emergencyHigh: 85,
  },
  // Sleep never reaches "emergency": emergency red is reserved for real emergencies.
  sleepHours: {
    label: 'Sleep', unit: 'h', decimals: 1, ideal: 7.5, weight: 0.1,
    warnLow: 6,
  },
}

// Sleep target shown on the sleep panel (hours per night).
export const SLEEP_TARGET_HOURS = 8

// Read a metric value out of a VitalReading (see docs/API_CONTRACT.md section 3).
export function readMetric(reading, key) {
  if (!reading) return undefined
  if (key === 'systolic') return reading.bloodPressure?.systolic
  if (key === 'diastolic') return reading.bloodPressure?.diastolic
  return reading[key]
}
