/** SVG completion ring for a single track. */
export const TrackRing = ({ pct, size = 56, label }: { pct: number; size?: number; label?: string }) => {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--blush))" strokeWidth={6} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="hsl(var(--pink))" strokeWidth={6} fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-display font-black">
        {label ?? `${pct}%`}
      </span>
    </div>
  );
};