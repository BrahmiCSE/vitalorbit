// Mission clock helpers. All maths is in UTC milliseconds so the result does not depend on the viewer's time zone.
const DAY_MS = 24 * 60 * 60 * 1000

/** Mission day number. Launch day is day 1. Returns 0 before launch. */
export function getMissionDay(launchDate, now = Date.now()) {
  const launch = new Date(launchDate).getTime()
  if (Number.isNaN(launch) || now < launch) return 0
  return Math.floor((now - launch) / DAY_MS) + 1
}

/** Planned length of the mission in whole days. Returns 0 if a date is invalid. */
export function getMissionLengthDays(launchDate, plannedEndDate) {
  const start = new Date(launchDate).getTime()
  const end = new Date(plannedEndDate).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0
  return Math.round((end - start) / DAY_MS)
}

/** Progress from 0 to 1, clamped. Returns 0 if the dates are invalid. */
export function getMissionProgress(launchDate, plannedEndDate, now = Date.now()) {
  const start = new Date(launchDate).getTime()
  const end = new Date(plannedEndDate).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0
  return Math.max(0, Math.min(1, (now - start) / (end - start)))
}
