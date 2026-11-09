/**
 * Icon — small inline SVG icons. Props: name, className.
 * Strokes use currentColor, so the icon takes the text color of its parent.
 */
const PATHS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  crew: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.4c2.1.7 3.5 2.6 3.5 5.6" /></>,
  vitals: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  twin: <><circle cx="12" cy="5" r="2.5" /><path d="M12 8v7M7 10.5l5-2.5 5 2.5M9 21l3-6 3 6" /></>,
  alerts: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8.5 3 8.5H3S6 15 6 8" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  ai: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
  settings: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
}

export default function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
