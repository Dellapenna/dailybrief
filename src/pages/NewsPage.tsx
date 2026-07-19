import NewsCard from '@/features/news/NewsCard'

export default function NewsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">News</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Top stories. Real impact.</p>
      <div className="mt-4">
        <NewsCard />
      </div>
    </div>
  )
}
