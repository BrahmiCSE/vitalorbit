import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-ink-muted">That address doesn’t lead anywhere. Head back to the console or the home page.</p>
      <div className="mt-6 flex gap-3">
        <Button to="/dashboard">Open console</Button>
        <Button to="/" variant="secondary">Home</Button>
      </div>
    </div>
  )
}
