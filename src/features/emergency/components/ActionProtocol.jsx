import GlassCard from '@/components/ui/GlassCard'

/** ActionProtocol — checklist for a training response. Props: scenario, checkedSteps, onToggle, phase. */
export default function ActionProtocol({ scenario, checkedSteps, onToggle, phase }) {
  return (
    <GlassCard title="RESPONSE PROTOCOL">
      <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3"><p className="text-sm font-medium text-ink">{scenario.title}</p><p className="mt-1 text-xs leading-relaxed text-ink-muted">{scenario.explanation}</p></div>
      <div className="space-y-3">
        {scenario.protocol.map((step, index) => {
          const checked = checkedSteps.includes(index)
          return <label key={`${scenario.id}-${index}`} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-white/[0.04]">
            <input type="checkbox" checked={checked} onChange={() => onToggle(index)} disabled={phase === 'idle'} className="mt-0.5 h-4 w-4 accent-cyan-400 disabled:opacity-40" />
            <span className={`text-sm leading-relaxed ${checked ? 'text-ink-muted line-through' : 'text-ink'}`}><span className="mr-2 font-mono text-xs text-primary">0{index + 1}</span>{step}</span>
          </label>
        })}
      </div>
      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-ink-muted">Training aid only. Follow mission-approved procedures and qualified medical direction. This checklist is not a diagnosis or treatment instruction.</p>
    </GlassCard>
  )
}
