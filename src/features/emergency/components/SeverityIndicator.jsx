import StatusBadge from '@/components/ui/StatusBadge'

/** SeverityIndicator — translates the simulator state into the shared health-status vocabulary. Props: severity. */
export default function SeverityIndicator({ severity }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-ink-muted">CURRENT SIMULATION STATE</p>
        <p className="mt-1 text-sm text-ink">{severity === 'emergency' ? 'Outside configured scenario limits' : severity === 'warning' ? 'Approaching configured scenario limits' : 'Within configured scenario baseline'}</p>
      </div>
      <StatusBadge status={severity} />
    </div>
  )
}
