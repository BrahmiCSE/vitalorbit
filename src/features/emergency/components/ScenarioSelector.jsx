import GlassCard from '@/components/ui/GlassCard'

/** ScenarioSelector — chooses an educational emergency scenario. Props: scenarios, selectedId, onSelect. */
export default function ScenarioSelector({ scenarios, selectedId, onSelect }) {
  return (
    <GlassCard title="SIMULATION SCENARIOS">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {scenarios.map((scenario, index) => {
          const selected = selectedId === scenario.id
          return (
            <button key={scenario.id} type="button" onClick={() => onSelect(scenario.id)} aria-pressed={selected}
              className={`rounded-xl border p-3 text-left transition ${selected ? 'border-primary/60 bg-primary/10 shadow-glow' : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]'}`}>
              <span className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] tracking-[0.18em] text-ink-muted">SCENARIO 0{index + 1}</span>
                <span className={`h-2 w-2 rounded-full ${selected ? 'bg-primary' : 'bg-white/20'}`} />
              </span>
              <span className="block text-sm font-semibold text-ink">{scenario.title}</span>
              <span className="mt-1 block text-xs text-ink-muted">{scenario.system}</span>
            </button>
          )
        })}
      </div>
    </GlassCard>
  )
}
