import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { NAV_ITEMS, SETTINGS_ITEM } from './navItems'
import MissionStatusIndicator from '@/components/ui/MissionStatusIndicator'
import { useCrewStatus } from '@/features/dashboard/CrewStatusContext'

/**
 * TopBar — sticky bar above the page content.
 * Shows the menu button (mobile), the current page name, the mission status and a settings link.
 * The mission status is the worst crew status, or 'unknown' while there is no data.
 * Props: onMenuClick (function that opens the mobile sidebar).
 */
export default function TopBar({ onMenuClick }) {
  const { pathname } = useLocation()
  const current = [...NAV_ITEMS, SETTINGS_ITEM].find((item) => item.to === pathname)
  const { status } = useCrewStatus()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-space/70 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuClick} aria-label="Open menu" className="rounded-lg p-2 text-ink-muted hover:bg-white/5 hover:text-ink lg:hidden">
          <Icon name="menu" />
        </button>
        <span className="font-display text-base font-medium">{current ? current.label : 'VitalOrbit'}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <MissionStatusIndicator status={status ?? 'unknown'} />
        <Link to={SETTINGS_ITEM.to} aria-label="Settings" className="rounded-lg p-2 text-ink-muted transition hover:bg-white/5 hover:text-ink">
          <Icon name="settings" />
        </Link>
      </div>
    </header>
  )
}
