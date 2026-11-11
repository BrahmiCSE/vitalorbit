// One list drives the sidebar, the top bar title and the landing page cards.
// To add a page: add an item here, a page in src/pages, and a <Route> in App.jsx.
export const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',    icon: 'dashboard', description: 'The mission at a glance: crew status, alerts and latest readings.' },
  { to: '/crew',         label: 'Crew',         icon: 'crew',      description: 'Every astronaut, their role and current health status.' },
  { to: '/vitals',       label: 'Vitals',       icon: 'vitals',    description: 'Heart rate, oxygen, temperature and more for each crew member.' },
  { to: '/digital-twin', label: 'Digital twin', icon: 'twin',      description: 'A 3D body model that shows where attention is needed.' },
  { to: '/emergency-simulation', label: 'Emergency sim', icon: 'emergency', description: 'Practise simulated crew-health response protocols and escalation workflows.' },
  { to: '/alerts',       label: 'Alerts',       icon: 'alerts',    description: 'Warnings and emergencies, with a record of who responded.' },
  { to: '/ai-insights',  label: 'AI insights',  icon: 'ai',        description: 'Risk assessments that explain what the model noticed.' },
]

export const SETTINGS_ITEM = { to: '/settings', label: 'Settings', icon: 'settings' }
