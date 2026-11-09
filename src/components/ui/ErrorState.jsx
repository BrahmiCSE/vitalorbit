import Icon from '@/components/layout/Icon'
import Button from '@/components/ui/Button'

/**
 * ErrorState — shown when a panel could not load. Uses the warning colour, because
 * emergency red is reserved for real emergencies.
 * Props: title, message, onRetry (adds a Retry button), compact (smaller, for inside a panel).
 */
export default function ErrorState({ title = 'Could not load this panel', message = 'Check the connection and try again.', onRetry, compact = false }) {
  return (
    <div role="alert" className={`flex flex-col items-start gap-3 ${compact ? '' : 'py-2'}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-warning"><Icon name="warning" /></span>
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <Icon name="refresh" className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  )
}
