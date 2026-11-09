// Which metrics the trend chart can show, and how each one is drawn.
//   series[].key      metric key from constants/vitals.js (systolic and diastolic are read from bloodPressure)
//   series[].colorClass Tailwind text colour. The chart line uses currentColor, so no hex values are needed.
//   limitKey          metric whose normal range is shaded behind the line (null = no shading)
//   domain            fixed y-axis range, or null to fit the data
export const TREND_METRICS = [
  { id: 'heartRate', label: 'Heart rate', unit: 'bpm', limitKey: 'heartRate', domain: null,
    series: [{ key: 'heartRate', name: 'Heart rate', colorClass: 'text-primary' }] },
  { id: 'spo2', label: 'SpO2', unit: '%', limitKey: 'spo2', domain: [84, 100],
    series: [{ key: 'spo2', name: 'SpO2', colorClass: 'text-primary' }] },
  { id: 'bodyTemperatureC', label: 'Temperature', unit: '°C', limitKey: 'bodyTemperatureC', domain: null,
    series: [{ key: 'bodyTemperatureC', name: 'Temperature', colorClass: 'text-primary' }] },
  { id: 'bloodPressure', label: 'Blood pressure', unit: 'mmHg', limitKey: null, domain: null,
    series: [
      { key: 'systolic', name: 'Systolic', colorClass: 'text-primary' },
      { key: 'diastolic', name: 'Diastolic', colorClass: 'text-ink' },
    ] },
  { id: 'respiratoryRate', label: 'Respiration', unit: 'br/min', limitKey: 'respiratoryRate', domain: null,
    series: [{ key: 'respiratoryRate', name: 'Respiration', colorClass: 'text-primary' }] },
  { id: 'stressIndex', label: 'Stress', unit: '', limitKey: 'stressIndex', domain: [0, 100],
    series: [{ key: 'stressIndex', name: 'Stress index', colorClass: 'text-primary' }] },
]
