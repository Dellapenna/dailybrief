import Disclosure from '@/components/Disclosure'
import PillarHero from '@/components/PillarHero'
import NewsCard from '@/features/news/NewsCard'
import StocksCard from '@/features/stocks/StocksCard'
import CryptoCard from '@/features/crypto/CryptoCard'
import SportsCard from '@/features/sports/SportsCard'
import HoroscopeCard from '@/features/horoscope/HoroscopeCard'
import FunFactCard from '@/features/funFact/FunFactCard'
import WeatherCard from '@/features/weather/WeatherCard'
import WorldClockCard from '@/features/worldclock/WorldClockCard'

export default function IntelligencePage() {
  return (
    <div>
      <PillarHero slug="intelligence" alt="Intelligence" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Intelligence</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Stay informed. Make smarter decisions. Lead the future.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Weather" defaultOpen>
          <WeatherCard />
        </Disclosure>

        <Disclosure title="News" subtitle="Real headlines, AI/Tech + general" defaultOpen>
          <NewsCard />
        </Disclosure>

        <Disclosure title="Stock Market">
          <StocksCard />
        </Disclosure>

        <Disclosure title="Crypto Market">
          <CryptoCard />
        </Disclosure>

        <Disclosure title="Sports">
          <SportsCard />
        </Disclosure>

        <Disclosure title="Horoscope">
          <HoroscopeCard />
        </Disclosure>

        <Disclosure title="Fun Fact of the Day">
          <FunFactCard />
        </Disclosure>

        <Disclosure title="World Clock" subtitle="Spain, Guatemala, Austin">
          <WorldClockCard />
        </Disclosure>
      </div>
    </div>
  )
}
