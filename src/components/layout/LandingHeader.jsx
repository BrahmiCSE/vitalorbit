import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

/** LandingHeader — top navigation for the public landing page. No props. */
const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/crew', label: 'Crew' },
  { to: '/vitals', label: 'Vitals' },
]

export default function LandingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <Link to="/" className="font-display text-xl font-bold tracking-tight text-primary">VitalOrbit</Link>
      <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="hidden rounded-lg px-3 py-2 text-sm text-ink-muted transition hover:bg-white/5 hover:text-ink md:block">
            {l.label}
          </Link>
        ))}
        <Button to="/dashboard" size="sm">Open console</Button>
      </nav>
    </header>
  )
}
