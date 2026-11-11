/**
 * Skeleton — grey pulsing block shown while data loads.
 * Props: className (set the size, for example "h-6 w-24"), label (screen reader text, optional).
 */
export default function Skeleton({ className = 'h-4 w-full', label }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} role={label ? 'status' : undefined} aria-hidden={label ? undefined : 'true'}>
      {label && <span className="sr-only">{label}</span>}
    </div>
  )
}
