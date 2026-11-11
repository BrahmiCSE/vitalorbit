import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { VITAL_LIMITS, readMetric } from '@/constants/vitals'
import { formatHourMinuteUtc, formatNumber } from '@/utils/format'
import { formatWithUnit } from '@/utils/vitalStatus'

/**
 * TrendChart — line chart of one metric (or two for blood pressure) over time, with the normal range shaded.
 * Props:
 *   readings  VitalReading[], oldest first (not empty)
 *   metric    one entry from TREND_METRICS
 * Colours come from Tailwind text classes through currentColor, so no hex values are used here.
 * Animation is off so the chart does not replay on every refresh.
 */
const BIG = 1e6

function toRows(readings, metric) {
  return readings.map((r) => {
    const row = { t: Date.parse(r.timestamp) }
    for (const s of metric.series) row[s.key] = readMetric(r, s.key)
    return row
  })
}

// Fit the y-axis to the data with a little padding, rounded to a tidy step so the tick labels look clean.
function fitDomain(rows, keys, decimals) {
  let min = Infinity
  let max = -Infinity
  for (const row of rows) {
    for (const k of keys) {
      const v = row[k]
      if (typeof v === 'number') {
        min = Math.min(min, v)
        max = Math.max(max, v)
      }
    }
  }
  if (!Number.isFinite(min)) return ['auto', 'auto']
  const span = max - min
  const pad = Math.max(span * 0.2, decimals > 0 ? 0.2 : 2)
  const step = decimals > 0 ? 0.5 : span <= 10 ? 2 : span <= 30 ? 5 : 10
  return [Math.floor((min - pad) / step) * step, Math.ceil((max + pad) / step) * step]
}

function TrendTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 text-xs">
      <p className="mb-1 text-ink-muted">{formatHourMinuteUtc(payload[0].payload.t)} UTC</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="telemetry">
          {p.name}: {formatWithUnit(formatNumber(p.value, VITAL_LIMITS[p.dataKey]?.decimals ?? 0), metric.unit)}
        </p>
      ))}
    </div>
  )
}

export default function TrendChart({ readings, metric }) {
  const rows = toRows(readings, metric)
  const keys = metric.series.map((s) => s.key)
  const limits = metric.limitKey ? VITAL_LIMITS[metric.limitKey] : null
  const decimals = VITAL_LIMITS[keys[0]]?.decimals ?? 0
  const domain = metric.domain ?? fitDomain(rows, keys, decimals)

  const values = rows.flatMap((r) => keys.map((k) => r[k])).filter((v) => typeof v === 'number')
  const summary = values.length
    ? `${metric.label}: latest ${formatWithUnit(formatNumber(values.at(-1), decimals), metric.unit)}, lowest ${formatNumber(Math.min(...values), decimals)}, highest ${formatNumber(Math.max(...values), decimals)}.`
    : `${metric.label}: no values.`

  return (
    <div className="h-64 w-full text-ink-muted" role="img" aria-label={summary}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.12} vertical={false} />
          {limits && (
            <ReferenceArea
              y1={limits.warnLow ?? -BIG} y2={limits.warnHigh ?? BIG} ifOverflow="hidden"
              fill="currentColor" fillOpacity={0.1} stroke="none" className="text-healthy"
            />
          )}
          <XAxis
            dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} tickCount={6}
            tickFormatter={formatHourMinuteUtc} stroke="currentColor" strokeOpacity={0.4}
            tick={{ fill: 'currentColor', fontSize: 12 }}
          />
          <YAxis
            domain={domain} width={44} stroke="currentColor" strokeOpacity={0.4}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            tickFormatter={(v) => formatNumber(v, decimals)}
          />
          <Tooltip
            content={<TrendTooltip metric={metric} />}
            cursor={{ stroke: 'currentColor', strokeOpacity: 0.3 }}
            isAnimationActive={false}
          />
          {metric.series.map((s) => (
            <Line
              key={s.key} dataKey={s.key} name={s.name} type="monotone" stroke="currentColor" strokeWidth={2}
              dot={false} activeDot={{ r: 4, fill: 'currentColor', stroke: 'none' }}
              isAnimationActive={false} className={s.colorClass}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
