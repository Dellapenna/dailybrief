import StocksCard from '@/features/stocks/StocksCard'

export default function StocksPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Stock Market</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Track markets. Make moves.</p>
      <div className="mt-6">
        <StocksCard />
      </div>
    </div>
  )
}
