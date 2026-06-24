interface MacroRingProps {
  value: number
  total: number
  label: string
  color: string
  size?: number
}

export function MacroRing({ value, total, label, color, size = 80 }: MacroRingProps) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = pct * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={circ - dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white">{value}</span>
          <span className="text-[10px] text-white/50">/{total}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-white/60">{label}</span>
    </div>
  )
}
