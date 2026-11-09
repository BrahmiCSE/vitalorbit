/**
 * GlassCard — the base container for every panel.
 * Props: title (optional), className (extra Tailwind classes), children.
 */
export default function GlassCard({ title, className = '', children }) {
  return (
    <section className={`glass p-4 sm:p-6 ${className}`}>
      {title && <h2 className="mb-3 text-sm font-medium text-ink-muted">{title}</h2>}
      {children}
    </section>
  )
}
