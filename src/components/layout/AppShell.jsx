import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { CrewStatusProvider } from '@/features/dashboard/CrewStatusContext'

/**
 * AppShell — frame for every console page: sidebar + top bar + page content.
 * Pages are drawn where <Outlet /> is. There is no props API: routes decide what shows.
 * <CrewStatusProvider> shares the crew list, so the top bar and the dashboard use one request.
 */
export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [pathname])

  // Close the mobile menu with the Escape key.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <CrewStatusProvider>
      <div className="min-h-screen lg:pl-64">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <TopBar onMenuClick={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </CrewStatusProvider>
  )
}
