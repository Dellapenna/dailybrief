import type { ReactNode } from 'react'
import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import Skeleton from '@/components/Skeleton'
import TabbedCard from '@/components/TabbedCard'
import { Sunrise, ListTodo, Target, Repeat, Sparkles, Hammer } from 'lucide-react'
import ExecutiveSummaryCard from '@/features/executiveSummary/ExecutiveSummaryCard'
import MissionProgress from '@/features/dashboard/MissionProgress'
import PillarTaskSummary from '@/features/pillarSummary/PillarTaskSummary'
import CheckInForm from '@/features/checkin/CheckInForm'
import TaskList from '@/features/tasks/TaskList'
import QuickAddBar from '@/features/tasks/QuickAddBar'
import GoalRow from '@/features/goals/GoalRow'
import { useGoals } from '@/features/goals/useGoals'
import HabitRow from '@/features/habits/HabitRow'
import { useHabits } from '@/features/habits/useHabits'
import HabitRecommendationsCard from '@/features/habits/HabitRecommendationsCard'
import type { PillarId } from '@/types/pillar'
import ExerciseLogCard from '@/features/exercise/ExerciseLogCard'
import BreathingTimer from '@/features/mind/BreathingTimer'
import CommunicationJournalCard from '@/features/communication/CommunicationJournalCard'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'
import PrayerCard from '@/features/soul/PrayerCard'
import GratitudeCard from '@/features/soul/GratitudeCard'
import ServiceCard from '@/features/soul/ServiceCard'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'

function SubSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function AllGoals() {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals()
  return (
    <div>
      <QuickAddBar onAdd={createGoal} placeholder="Add a goal…" />
      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}
      <div className="mt-3 space-y-2">
        {loading ? (
          <Skeleton lines={3} />
        ) : goals.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No goals yet — add one above.</p>
        ) : (
          goals.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              onUpdate={(updates) => updateGoal(goal.id, updates)}
              onDelete={() => deleteGoal(goal.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Consolidated all-pillars habit list — habits used to live scattered
 * under each pillar page's own "Habits" Disclosure. Consolidated here on
 * request, with a pillar selector per row so each habit can still be
 * tagged/organized by pillar without needing a separate page per pillar.
 * (Soul/Mind's special habits — Prayer, Gratitude, Service, Breathing
 * Meditation — still also get their own dedicated card UI in Practices
 * below for the guided prompt/timer; they'll also appear here as
 * ordinary rows, which is expected, not a bug.)
 */
function AllHabits() {
  const { habits, loading, error, createHabit, toggleToday, updateHabit, deleteHabit } = useHabits()
  return (
    <div>
      <QuickAddBar onAdd={createHabit} placeholder="Add a habit…" />
      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}
      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <Skeleton lines={3} />
        ) : habits.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No habits yet — add one above.</p>
        ) : (
          habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onToggle={toggleToday}
              onDelete={(h) => deleteHabit(h.id)}
              onPillarChange={(h, pillarId) => updateHabit(h.id, { pillar_id: pillarId as PillarId | null })}
              showPillarSelector
            />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Mission Control — "Plan. Execute. Win. You are the captain." Leans
 * toward inputs (things you create/enter) per the organization pass:
 * Check-in, Plan (tasks), Goals, Habits, plus Executive Summary/Analyze
 * which review those inputs. Daily Dashboard is the reading/
 * informational counterpart — see that page.
 *
 * Practices (new): Body/Mind/Soul retired as separate destinations —
 * their "things you do" content (Exercise Log, Prayer, Communication
 * Journal, etc.) consolidated here as pillar-tabbed sections instead,
 * per direct feedback that those 3 pages weren't earning visits on
 * their own. Reading-oriented content from the same pillars went to
 * Daily Dashboard's "Reflect & Learn" instead — see that page.
 */
export default function MissionControlPage() {
  return (
    <div>
      <PillarHero slug="mission-control" alt="Mission Control" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Mission Control</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Plan. Execute. Win. You are the captain.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Morning Check-in" icon={Sunrise} defaultOpen>
          <CheckInForm />
        </Disclosure>

        <Disclosure title="Plan" subtitle="Today's tasks, all pillars" icon={ListTodo} defaultOpen>
          <TaskList view="today" quickAddPlaceholder="Add a task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="All pillars" icon={Target} defaultOpen>
          <AllGoals />
        </Disclosure>

        <Disclosure title="Habits" subtitle="All pillars — tag each one below" icon={Repeat} defaultOpen>
          <AllHabits />
        </Disclosure>

        <Disclosure title="Practices" subtitle="Things you do, by pillar" icon={Hammer} defaultOpen>
          <TabbedCard
            tabs={[
              { label: 'Body', content: <ExerciseLogCard /> },
              {
                label: 'Mind',
                content: (
                  <div className="space-y-4">
                    <SubSection label="Meditate">
                      <BreathingTimer />
                    </SubSection>
                    <SubSection label="Communication Practice Journal">
                      <CommunicationJournalCard />
                    </SubSection>
                    <SubSection label="Idea Vault">
                      <IdeaVaultSection />
                    </SubSection>
                  </div>
                ),
              },
              {
                label: 'Soul',
                content: (
                  <div className="space-y-4">
                    <SubSection label="Faith — Prayer">
                      <PrayerCard />
                    </SubSection>
                    <SubSection label="Gratitude">
                      <GratitudeCard />
                    </SubSection>
                    <SubSection label="Reflection — Evening Review">
                      <EveningReviewForm />
                    </SubSection>
                    <SubSection label="Service">
                      <ServiceCard />
                    </SubSection>
                  </div>
                ),
              },
            ]}
          />
        </Disclosure>

        <Disclosure title="Insights" subtitle="Executive Summary, Progress, Habit Ideas" icon={Sparkles}>
          <TabbedCard
            tabs={[
              { label: 'Executive Summary', content: <ExecutiveSummaryCard /> },
              {
                label: 'Progress',
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MissionProgress />
                    <PillarTaskSummary />
                  </div>
                ),
              },
              { label: 'Habit Ideas', content: <HabitRecommendationsCard /> },
            ]}
          />
        </Disclosure>
      </div>
    </div>
  )
}
