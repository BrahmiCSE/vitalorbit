import PageHeader from '@/components/layout/PageHeader'
import GlassCard from '@/components/ui/GlassCard'

/**
 * PlaceholderPage — stand-in for screens that are not built yet.
 * Props: title, description. Replace the whole page when the real one is built.
 */
export default function PlaceholderPage({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <GlassCard>
        <p className="font-medium">This screen is not built yet.</p>
        <p className="mt-1 text-sm text-ink-muted">The page, its link and its route are ready. The content comes in a later stage.</p>
      </GlassCard>
    </>
  )
}
