import { Link } from 'react-router-dom'
import Disclosure from '@/components/Disclosure'
import PillarHero from '@/components/PillarHero'
import MissionProgress from '@/features/dashboard/MissionProgress'
import PillarTaskSummary from '@/features/pillarSummary/PillarTaskSummary'
import CalendarSection from '@/features/calendar/CalendarSection'
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
 * Mission Control — the dashboard, tile 1 of the pillar-based nav
 * rebuild. Deliberately leaner than the old Briefing page: Weather,
 * Horoscope, News, and the rest all moved to Intelligence (per the
 * pillar mapping), leaving this focused on "command your day": progress,
 * cross-pillar to-do counts, calendar, today's top 3, and the morning
 * check-in.
 */
export default function MissionControlPage() {
  return (
    <div>
      <PillarHero slug="mission-control" alt="Mission Control" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Mission Control</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Your dashboard. Command your day.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Progress" subtitle="Habits, goals, tasks at a glance" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <MissionProgress />
            <PillarTaskSummary />
          </div>
        </Disclosure>

        <Disclosure title="Calendar" subtitle="Agenda and month view">
          <CalendarSection />
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
