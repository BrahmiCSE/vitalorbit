// Small display formatters. Pure functions, no side effects.

/** Number with fixed decimals, or "--" when there is no value. */
export function formatNumber(value, decimals = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return value.toFixed(decimals)
}

/** "just now", "5 min ago", "2 h ago", "3 d ago". Returns "--" for invalid dates. */
export function formatTimeAgo(iso, now = Date.now()) {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '--'
  const seconds = Math.max(0, Math.round((now - t) / 1000))
  if (seconds < 45) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return `${Math.round(hours / 24)} d ago`
}

/** "14:05:09 UTC" */
export function formatClockUtc(ms) {
  return `${new Date(ms).toISOString().slice(11, 19)} UTC`
}

/** "09 Nov 2026" in UTC. */
export function formatDateUtc(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "14:05" in UTC, for chart axes. */
export function formatHourMinuteUtc(ms) {
  return new Date(ms).toISOString().slice(11, 16)
}

/** Two-letter initials from a name like "Cmdr. A. Rivera" -> "AR". */
export function initials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '--'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words.at(-2)[0] + words.at(-1)[0]).toUpperCase()
}
