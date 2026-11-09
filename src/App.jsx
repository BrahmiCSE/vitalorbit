import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import LandingPage from '@/pages/LandingPage'
import DashboardPage from '@/pages/DashboardPage'
import CrewPage from '@/pages/CrewPage'
import VitalsPage from '@/pages/VitalsPage'
import DigitalTwinPage from '@/pages/DigitalTwinPage'
import AlertsPage from '@/pages/AlertsPage'
import AiInsightsPage from '@/pages/AiInsightsPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Every route lives here. Pages inside <AppShell> get the sidebar and top bar.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/crew" element={<CrewPage />} />
          <Route path="/vitals" element={<VitalsPage />} />
          <Route path="/digital-twin" element={<DigitalTwinPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/ai-insights" element={<AiInsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
