import PillarHero from '@/components/PillarHero'
import QuickAddBar from '@/features/tasks/QuickAddBar'
import HabitRow from '@/features/habits/HabitRow'
import { useHabits } from '@/features/habits/useHabits'
import PracticeCard from '@/features/habits/PracticeCard'
import ExerciseLogCard from '@/features/exercise/ExerciseLogCard'
import BreathingTimer from '@/features/mind/BreathingTimer'
import CommunicationJournalCard from '@/features/communication/CommunicationJournalCard'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'
import PrayerCard from '@/features/soul/PrayerCard'
import GratitudeCard from '@/features/soul/GratitudeCard'
import ServiceCard from '@/features/soul/ServiceCard'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'
import type { PillarId } from '@/types/pillar'

/**
 * Habits + Practices — moved here from Mission Control per direct
 * request, so Mission Control stays focused on Check-in/Plan/Goals/
 * Insights. Practices (things you do, previously grouped into pillar
 * tabs) are now individually color-coded cards instead — easier to
 * visually tell apart at a glance than several items stacked together
 * inside a shared tab.
 */
export default function HabitsPage() {
  const { habits, loading, error, createHabit, toggleToday, updateHabit, deleteHabit } = useHabits()

  return (
    <div>
      <PillarHero slug="habits" alt="Habits" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Habits</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Small actions. Big transformation.</p>

      <div className="mt-4">
        <QuickAddBar onAdd={createHabit} placeholder="Add a daily habit…" />
      </div>

      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4 rounded-xl border border-rdp-line bg-rdp-panel px-3">
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

      <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">Practices</p>
      <div className="mt-2 space-y-3">
        <PracticeCard pillar="body" title="Exercise Log">
          <ExerciseLogCard />
        </PracticeCard>

        <PracticeCard pillar="mind" title="Meditate">
          <BreathingTimer />
        </PracticeCard>

        <PracticeCard pillar="mind" title="Communication Practice Journal">
          <CommunicationJournalCard />
        </PracticeCard>

        <PracticeCard pillar="mind" title="Idea Vault">
          <IdeaVaultSection />
        </PracticeCard>

        <PracticeCard pillar="soul" title="Faith — Prayer">
          <PrayerCard />
        </PracticeCard>

        <PracticeCard pillar="soul" title="Gratitude">
          <GratitudeCard />
        </PracticeCard>

        <PracticeCard pillar="soul" title="Reflection — Evening Review">
          <EveningReviewForm />
        </PracticeCard>

        <PracticeCard pillar="soul" title="Service">
          <ServiceCard />
        </PracticeCard>
      </div>
    </div>
  )
}
