import './Ring.css'

/**
 * The reusable progress ring — this app's signature element, built as a
 * pace gauge rather than a plain donut. Indigo fills up to actual spend;
 * when `pacePercent` is given, a yellow tick marks where you'd be if
 * spending fell evenly across the period, and any spend past that tick
 * renders in amber instead of indigo. Omit `pacePercent` for a plain
 * single-color ring (e.g. the compact Profile budget indicator).
 */
export default function Ring({
  percent = 0,
  pacePercent = null,
  size = 200,
  strokeWidth = 14,
  children,
  trackColor = 'var(--accent-primary-muted)',
}) {
  const clamped = Math.min(100, Math.max(0, percent))
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius

  const hasPace = pacePercent !== null && pacePercent !== undefined
  const overPace = hasPace && clamped > pacePercent
  const indigoEnd = hasPace ? Math.min(clamped, pacePercent) : clamped

  const arc = (startFraction, endFraction) => {
    const len = Math.max(0, (endFraction - startFraction) * circumference)
    return {
      strokeDasharray: `${len} ${circumference - len}`,
      strokeDashoffset: -(startFraction * circumference),
    }
  }

  const tickPoint = (fraction) => {
    const angle = (fraction * 360 - 90) * (Math.PI / 180)
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-indigo)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          className="ring__fill ring__fill--indigo"
          style={arc(0, indigoEnd / 100)}
        />
        {overPace ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--color-amber)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            className="ring__fill ring__fill--amber"
            style={arc(pacePercent / 100, clamped / 100)}
          />
        ) : null}
        {hasPace ? (
          <circle
            cx={tickPoint(pacePercent / 100).x}
            cy={tickPoint(pacePercent / 100).y}
            r={Math.max(3, strokeWidth * 0.3)}
            className="ring__pace-tick"
          />
        ) : null}
      </svg>
      {children ? <div className="ring__content">{children}</div> : null}
    </div>
  )
}
