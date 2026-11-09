import PageHeader from '@/components/layout/PageHeader'
import GlassCard from '@/components/ui/GlassCard'

// Placeholder cards only. No calculations here: real data arrives in a later stage.
const CARDS = ['Crew status', 'Open alerts', 'Latest readings']

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="The mission at a glance. Live data is coming in a later stage." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((title) => (
          <GlassCard key={title} title={title}>
            <p className="telemetry text-4xl text-ink-muted">--</p>
          </GlassCard>
        ))}
      </div>
    </>
  )
}
