/**
 * A pulsing placeholder shaped like the real content, instead of a bare
 * "Loading…" string — reads as "this is loading" rather than "did
 * something break." `lines` controls how many text-line bars to show.
 */
export default function Skeleton({ lines = 2, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-rdp-line"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}
