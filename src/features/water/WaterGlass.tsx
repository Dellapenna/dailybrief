/** A single glass silhouette — outline when empty, filled blue when consumed. */
export default function WaterGlass({ filled, className = '' }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden="true">
      <path
        d="M5 3 H19 L16.5 28 Q16.3 30 14 30 H10 Q7.7 30 7.5 28 Z"
        fill={filled ? '#38bdf8' : 'none'}
        stroke={filled ? '#38bdf8' : 'currentColor'}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}
