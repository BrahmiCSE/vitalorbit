import { Link } from 'react-router-dom'
import LandingHeader from '@/components/layout/LandingHeader'
import { NAV_ITEMS } from '@/components/layout/navItems'
import Icon from '@/components/layout/Icon'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'

// Decorative orbit graphic. Colors come from Tailwind tokens, not hex values.
function OrbitGraphic() {
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label="Three orbits with crew markers" className="mx-auto w-full max-w-sm lg:max-w-md">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
        <circle cx="200" cy="200" r="80" />
        <circle cx="200" cy="200" r="130" />
        <circle cx="200" cy="200" r="180" />
      </g>
      <circle cx="200" cy="200" r="34" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      <circle cx="269" cy="160" r="12" className="fill-healthy/20" />
      <circle cx="269" cy="160" r="5" className="fill-healthy" />
      <circle cx="78" cy="156" r="12" className="fill-healthy/20" />
      <circle cx="78" cy="156" r="5" className="fill-healthy" />
      <circle cx="290" cy="356" r="12" className="fill-warning/20" />
      <circle cx="290" cy="356" r="5" className="fill-warning" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Keep every astronaut’s health in view.</h1>
            <p className="mt-5 max-w-lg text-lg text-ink-muted">
              VitalOrbit brings vitals, alerts and AI insights from the whole mission into one calm console.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/dashboard" size="lg">Open console</Button>
              <Button to="/crew" variant="secondary" size="lg">See the crew</Button>
            </div>
          </div>
          <OrbitGraphic />
        </section>

        <section className="pb-16">
          <h2 className="mb-6 text-2xl font-bold">What you can monitor</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to} className="group block rounded-card">
                <GlassCard className="h-full transition group-hover:border-primary/40">
                  <span className="mb-3 inline-flex rounded-lg bg-primary-soft p-2 text-primary">
                    <Icon name={item.icon} />
                  </span>
                  <h3 className="text-lg font-medium">{item.label}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-ink-muted">
        VitalOrbit is a demo build. All data shown will be simulated.
      </footer>
    </div>
  )
}
