import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import { Lightbulb, Repeat } from 'lucide-react'
import QuickAddBar from '@/features/tasks/QuickAddBar'
import HabitRow from '@/features/habits/HabitRow'
import { useHabits } from '@/features/habits/useHabits'
import HabitRecommendationsCard from '@/features/habits/HabitRecommendationsCard'
import PracticeGroup, { PracticeSubItem } from '@/features/habits/PracticeGroup'
import ExerciseLogCard from '@/features/exercise/ExerciseLogCard'
import BreathingTimer from '@/features/mind/BreathingTimer'
import CommunicationJournalCard from '@/features/communication/CommunicationJournalCard'
import PrayerCard from '@/features/soul/PrayerCard'
import GratitudeCard from '@/features/soul/GratitudeCard'
import ServiceCard from '@/features/soul/ServiceCard'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'
import type { PillarId } from '@/types/pillar'

function AllHabits() {
  const { habits, loading, error, createHabit, toggleToday, updateHabit, deleteHabit } = useHabits()
  return (
    <div>
      <QuickAddBar onAdd={createHabit} placeholder="Add a daily habit…" />
      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}
      <div className="mt-3 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : habits.length === 0 ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">No habits yet — add one above.</p>
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
 * Habits & Logbook. Habit check-in is now collapsible too (Disclosure),
 * matching Habit Ideas and Practices, per direct feedback — everything
 * on this page collapses the same way now, nothing sits permanently
 * expanded by default except what's genuinely meant to be glanced at
 * daily.
 *
 * Practices regrouped by pillar (3 collapsible groups: Body/Mind/Soul)
 * instead of 8 flat individually-collapsible cards — reads as "combined
 * in a way that makes sense" per feedback, matching how pillar grouping
 * already works everywhere else in the app.
 */
export default function HabitsPage() {
  return (
    <div>
      <PillarHero slug="habits" alt="Habits & Logbook" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Habits & Logbook</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Build consistency. Track progress. Become legendary.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Habit Check-in" subtitle="All pillars — tag each one below" icon={Repeat} defaultOpen>
          <AllHabits />
        </Disclosure>

        <Disclosure title="Habit Ideas" subtitle="AI suggestions grounded in your active goals" icon={Lightbulb}>
          <HabitRecommendationsCard />
        </Disclosure>
      </div>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">Practices</p>
      <div className="mt-2 space-y-3">
        <PracticeGroup pillar="body">
          <PracticeSubItem label="Exercise Log">
            <ExerciseLogCard />
          </PracticeSubItem>
        </PracticeGroup>

        <PracticeGroup pillar="mind">
          <PracticeSubItem label="Meditate">
            <BreathingTimer />
          </PracticeSubItem>
          <PracticeSubItem label="Communication Practice Journal">
            <CommunicationJournalCard />
          </PracticeSubItem>
        </PracticeGroup>

        <PracticeGroup pillar="soul">
          <PracticeSubItem label="Faith — Prayer">
            <PrayerCard />
          </PracticeSubItem>
          <PracticeSubItem label="Gratitude">
            <GratitudeCard />
          </PracticeSubItem>
          <PracticeSubItem label="Reflection — Evening Review">
            <EveningReviewForm />
          </PracticeSubItem>
          <PracticeSubItem label="Service">
            <ServiceCard />
          </PracticeSubItem>
        </PracticeGroup>
      </div>
    </div>
  )
}
