import { Link } from 'react-router-dom'
import Disclosure from '@/components/Disclosure'
import WeatherCard from '@/features/weather/WeatherCard'
import CalendarSection from '@/features/calendar/CalendarSection'
import HoroscopeCard from '@/features/horoscope/HoroscopeCard'
import MissionProgress from '@/features/dashboard/MissionProgress'
import NewsCard from '@/features/news/NewsCard'
import CheckInForm from '@/features/checkin/CheckInForm'
import { useTasks } from '@/features/tasks/useTasks'

function TodaysMission() {
  const { tasks, loading, updateTask } = useTasks('today')
  const topThree = tasks.slice(0, 3)

  return (
    <div>
      {loading && <p className="text-sm text-rdp-text-faint">Loading…</p>}

      {!loading && topThree.length === 0 && (
        <p className="text-sm text-rdp-text-dim">
          Nothing flagged for today yet.{' '}
          <Link to="/tasks" className="text-rdp-signal">
            Add something
          </Link>
          .
        </p>
      )}

      {topThree.length > 0 && (
        <ul className="space-y-2">
          {topThree.map((task) => (
            <li key={task.id} className="flex items-center gap-3">
              <button
                onClick={() => updateTask(task.id, { status: 'completed' })}
                aria-label="Mark complete"
                className="h-5 w-5 shrink-0 rounded-full border-2 border-rdp-text-faint hover:border-rdp-signal"
              />
              <span className="text-sm text-rdp-text">{task.title}</span>
            </li>
          ))}
        </ul>
      )}

      <Link to="/tasks" className="mt-3 inline-block text-xs font-medium text-rdp-signal">
        View all tasks
      </Link>
    </div>
  )
}

/**
 * The full "Daily Briefing" dashboard — everything that used to live on
 * Mission Control (weather, calendar, horoscope, mission progress, news,
 * today's tasks) plus the morning check-in, now that Mission Control
 * itself is the tappable nav map (see NavMapPage). Converted to
 * collapsible sections on request, so the whole dashboard is reachable
 * on one page without a long forced scroll — Snapshot and Check-in open
 * by default (the two things worth seeing/doing first thing), the rest
 * collapsed but one tap away.
 */
export default function BriefingPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Morning Intelligence</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Your daily edge, all in one place.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Snapshot" subtitle="Weather, progress, horoscope" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <WeatherCard />
            <MissionProgress />
            <HoroscopeCard />
          </div>
        </Disclosure>

        <Disclosure title="Calendar" subtitle="Agenda and month view">
          <CalendarSection />
        </Disclosure>

        <Disclosure title="News" subtitle="Real headlines, AI/Tech + general">
          <NewsCard />
        </Disclosure>

        <Disclosure title="Today's Mission" subtitle="Top 3 from Smart Today" defaultOpen>
          <TodaysMission />
        </Disclosure>

        <Disclosure title="Morning Check-in" subtitle="Sleep, energy, mood, stress" defaultOpen>
          <CheckInForm />
        </Disclosure>
      </div>
    </div>
  )
}
