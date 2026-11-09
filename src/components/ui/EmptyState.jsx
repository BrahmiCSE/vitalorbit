import Icon from '@/components/layout/Icon'

/**
 * EmptyState — shown when a panel loaded fine but has nothing to list.
 * Props: title, message (optional), icon (an Icon name, default "info"), tone ('neutral' | 'healthy').
 */
export default function EmptyState({ title, message, icon = 'info', tone = 'neutral' }) {
  const color = tone === 'healthy' ? 'text-healthy' : 'text-ink-muted'
  return (
    <div className="flex items-start gap-3 py-2">
      <span className={`mt-0.5 ${color}`}><Icon name={icon} /></span>
      <div>
        <p className="font-medium">{title}</p>
        {message && <p className="mt-0.5 text-sm text-ink-muted">{message}</p>}
      </div>
    </div>
  )
}
