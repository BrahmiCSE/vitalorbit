import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import { NAV_ITEMS, SETTINGS_ITEM } from './navItems'

/**
 * Sidebar — main navigation.
 * Desktop (lg and up): always visible on the left.
 * Mobile: a drawer that slides in. Props: open (boolean), onClose (function).
 */
function SidebarLink({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isActive ? 'bg-primary-soft text-primary' : 'text-ink-muted hover:bg-white/5 hover:text-ink'
        }`
      }
    >
      <Icon name={item.icon} />
      {item.label}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-space-raised/95 p-4 backdrop-blur-xl transition-[transform,visibility] duration-200 lg:visible lg:translate-x-0 ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-3 pt-1">
          <Link to="/" className="font-display text-lg font-bold tracking-tight text-primary">VitalOrbit</Link>
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 text-ink-muted hover:bg-white/5 hover:text-ink lg:hidden">
            <Icon name="close" />
          </button>
        </div>

        <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => <SidebarLink key={item.to} item={item} onClick={onClose} />)}
        </nav>

        <div className="border-t border-white/10 pt-3">
          <SidebarLink item={SETTINGS_ITEM} onClick={onClose} />
        </div>
      </aside>
    </>
  )
}
