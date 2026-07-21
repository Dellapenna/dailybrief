import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import TabbedCard from '@/components/TabbedCard'
import WeatherCard from '@/features/weather/WeatherCard'
import CalendarSection from '@/features/calendar/CalendarSection'
import NewsCard from '@/features/news/NewsCard'
import StocksCard from '@/features/stocks/StocksCard'
import CryptoCard from '@/features/crypto/CryptoCard'
import SportsCard from '@/features/sports/SportsCard'
import HoroscopeCard from '@/features/horoscope/HoroscopeCard'
import FunFactCard from '@/features/funFact/FunFactCard'
import DadJokeCard from '@/features/dadJoke/DadJokeCard'
import WorldClockCard from '@/features/worldclock/WorldClockCard'

/**
 * Daily Dashboard — "Your day. Your intelligence. Your edge." Leans
 * toward reading/informational content per the organization pass —
 * Morning Check-in moved to Mission Control since it's an input, not
 * something you read.
 */
export default function DailyDashboardPage() {
  return (
    <div>
      <PillarHero slug="daily-dashboard" alt="Daily Dashboard" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Daily Dashboard</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Your day. Your intelligence. Your edge.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Weather" defaultOpen>
          <WeatherCard />
        </Disclosure>

        <Disclosure title="Calendar" subtitle="Agenda and month view" defaultOpen>
          <CalendarSection />
        </Disclosure>

        <Disclosure title="News" defaultOpen>
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

        <Disclosure title="More" subtitle="Horoscope, Fun Fact, Dad Joke">
          <TabbedCard
            tabs={[
              { label: 'Horoscope', content: <HoroscopeCard /> },
              { label: 'Fun Fact', content: <FunFactCard /> },
              { label: 'Dad Joke', content: <DadJokeCard /> },
            ]}
          />
        </Disclosure>

        <Disclosure title="World Clock" subtitle="Spain, Guatemala, Austin">
          <WorldClockCard />
        </Disclosure>
      </div>
    </div>
  )
}
