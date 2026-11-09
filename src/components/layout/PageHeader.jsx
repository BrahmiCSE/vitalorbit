/** PageHeader — title and one-line description at the top of every page. Props: title, description. */
export default function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-ink-muted">{description}</p>}
    </div>
  )
}
