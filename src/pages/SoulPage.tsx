import Disclosure from '@/components/Disclosure'
import PillarHero from '@/components/PillarHero'
import PrayerCard from '@/features/soul/PrayerCard'
import GratitudeCard from '@/features/soul/GratitudeCard'
import ServiceCard from '@/features/soul/ServiceCard'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

export default function SoulPage() {
  return (
    <div>
      <PillarHero slug="soul" alt="Soul" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Soul</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Faith. Purpose. Peace. Strengthen your soul within.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Faith" subtitle="Prayer" defaultOpen>
          <PrayerCard />
        </Disclosure>

        <Disclosure title="Gratitude" defaultOpen>
          <GratitudeCard />
        </Disclosure>

        <Disclosure title="Reflection" subtitle="Evening Review" defaultOpen>
          <EveningReviewForm />
        </Disclosure>

        <Disclosure title="Service">
          <ServiceCard />
        </Disclosure>

        <Disclosure title="Tasks" subtitle="Soul-tagged to-dos">
          <TaskList view="today" pillar="soul" quickAddPlaceholder="Add a Soul task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="Soul-tagged goals">
          <PillarGoals pillar="soul" />
        </Disclosure>
      </div>
    </div>
  )
}
