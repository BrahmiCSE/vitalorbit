import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'

/** IncidentHistory — lists completed training scenarios for this page session. Props: incidents, events. */
export default function IncidentHistory({ incidents, events }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GlassCard title="SESSION EVENT TIMELINE">
        {events.length === 0 ? <EmptyState title="No events recorded" message="Start a scenario to populate the event timeline." /> : <ol className="space-y-3">{events.map((event) => <li key={event.id} className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" /><div><p className="text-sm font-medium text-ink">{event.label}</p><p className="mt-0.5 text-xs text-ink-muted">{event.detail}</p></div></li>)}</ol>}
      </GlassCard>
      <GlassCard title="INCIDENT HISTORY">
        {incidents.length === 0 ? <EmptyState title="No completed incidents" message="Recovered or escalated scenarios will appear here." /> : <div className="space-y-3">{incidents.map((incident) => <div key={incident.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 last:border-0 last:pb-0"><div><p className="text-sm font-medium text-ink">{incident.title}</p><p className="mt-1 text-xs text-ink-muted">{new Date(incident.startedAt).toLocaleString()} · {incident.finalValue} {incident.unit}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${incident.outcome === 'recovered' ? 'bg-healthy/10 text-healthy' : 'bg-warning/10 text-warning'}`}>{incident.outcome}</span></div>)}</div>}
      </GlassCard>
    </div>
  )
}
