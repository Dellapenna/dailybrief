import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import TabbedCard from '@/components/TabbedCard'
import { CloudSun, Calendar, Newspaper, LineChart, Coins, Trophy, Sparkles, Clock, BookOpen } from 'lucide-react'
import WeatherCard from '@/features/weather/WeatherCard'
import CalendarSection from '@/features/calendar/CalendarSection'
import NewsCard from '@/features/news/NewsCard'
import StocksCard from '@/features/stocks/StocksCard'
import CryptoCard from '@/features/crypto/CryptoCard'
import SportsCard from '@/features/sports/SportsCard'
import HoroscopeCard from '@/features/horoscope/HoroscopeCard'
import FunFactCard from '@/features/funFact/FunFactCard'
import DadJokeCard from '@/features/dadJoke/DadJokeCard'
import MotivationCard from '@/features/motivation/MotivationCard'
import WordOfDayCard from '@/features/wordOfDay/WordOfDayCard'
import WorldClockCard from '@/features/worldclock/WorldClockCard'
import HealthTrends from '@/features/exercise/HealthTrends'
import SpanishWordCard from '@/features/spanish/SpanishWordCard'
import CommunicationTipCard from '@/features/communication/CommunicationTipCard'
import StoicQuoteCard from '@/features/stoic/StoicQuoteCard'

/**
 * Daily Dashboard — "Your day. Your intelligence. Your edge." Leans
 * toward reading/informational content per the organization pass —
 * Morning Check-in moved to Mission Control since it's an input, not
 * something you read. Motivation Quote and Word of the Day moved here
 * from Mind per the new reference map, which lists both under Daily
 * Dashboard alongside Fun Fact/Dad Joke.
 *
 * Reflect & Learn (new): Body/Mind/Soul retired as separate
 * destinations — their reading-oriented content (Health Trends,
 * Spanish/Communication Tip, Stoic Wisdom) consolidated here as
 * pillar-tabbed sections, per direct feedback those 3 pages weren't
 * earning visits on their own. "Do" content from the same pillars went
 * to Mission Control's "Practices" instead — see that page.
 */
export default function DailyDashboardPage() {
  return (
    <div>
      <PillarHero slug="daily-dashboard" alt="Daily Dashboard" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Daily Dashboard</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Your day. Your intelligence. Your edge.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Weather" icon={CloudSun} defaultOpen>
          <WeatherCard />
        </Disclosure>

        <Disclosure title="Calendar" subtitle="Agenda and month view" icon={Calendar} defaultOpen>
          <CalendarSection />
        </Disclosure>

        <Disclosure title="News" icon={Newspaper} defaultOpen>
          <NewsCard />
        </Disclosure>

        <Disclosure title="Stock Market" icon={LineChart}>
          <StocksCard />
        </Disclosure>

        <Disclosure title="Crypto Market" icon={Coins}>
          <CryptoCard />
        </Disclosure>

        <Disclosure title="Sports" icon={Trophy}>
          <SportsCard />
        </Disclosure>

        <Disclosure title="Reflect & Learn" subtitle="Things you read, by pillar" icon={BookOpen} defaultOpen>
          <TabbedCard
            tabs={[
              { label: 'Body', content: <HealthTrends /> },
              {
                label: 'Mind',
                content: (
                  <div className="space-y-3">
                    <SpanishWordCard />
                    <CommunicationTipCard />
                  </div>
                ),
              },
              { label: 'Soul', content: <StoicQuoteCard /> },
            ]}
          />
        </Disclosure>

        <Disclosure
          title="More"
          subtitle="Motivation, Word of the Day, Horoscope, Fun Fact, Dad Joke"
          icon={Sparkles}
        >
          <TabbedCard
            tabs={[
              { label: 'Motivation', content: <MotivationCard /> },
              { label: 'Word of the Day', content: <WordOfDayCard /> },
              { label: 'Horoscope', content: <HoroscopeCard /> },
              { label: 'Fun Fact', content: <FunFactCard /> },
              { label: 'Dad Joke', content: <DadJokeCard /> },
            ]}
          />
        </Disclosure>

        <Disclosure title="World Clock" subtitle="Spain, Guatemala, Austin" icon={Clock}>
          <WorldClockCard />
        </Disclosure>
      </div>
    </div>
  )
}
