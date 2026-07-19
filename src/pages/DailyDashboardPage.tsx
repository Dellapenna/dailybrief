import Disclosure from '@/components/Disclosure'
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
import CheckInForm from '@/features/checkin/CheckInForm'

/**
 * Daily Dashboard — "Your day. Your intelligence. Your edge." per the
 * reference image: everything informational (today's data) plus the
 * morning check-in ritual. Goals/tasks/planning live on Mission Control
 * instead — a real split introduced by the 5-zone consolidation.
 */
export default function DailyDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Daily Dashboard</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Your day. Your intelligence. Your edge.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Weather" defaultOpen>
          <WeatherCard />
        </Disclosure>

        <Disclosure title="Calendar" subtitle="Agenda and month view" defaultOpen>
          <CalendarSection />
        </Disclosure>

        <Disclosure title="Morning Check-in" defaultOpen>
          <CheckInForm />
        </Disclosure>

        <Disclosure title="News">
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

        <Disclosure title="Daily Dad Joke">
          <DadJokeCard />
        </Disclosure>

        <Disclosure title="World Clock" subtitle="Spain, Guatemala, Austin">
          <WorldClockCard />
        </Disclosure>
      </div>
    </div>
  )
}
