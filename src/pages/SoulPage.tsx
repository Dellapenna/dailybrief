import FrameShell from '@/components/FrameShell'
import Disclosure from '@/components/Disclosure'
import PrayerCard from '@/features/soul/PrayerCard'
import GratitudeCard from '@/features/soul/GratitudeCard'
import ServiceCard from '@/features/soul/ServiceCard'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'
import TaskList from '@/features/tasks/TaskList'
import PillarGoals from '@/features/goals/PillarGoals'

export default function SoulPage() {
  return (
    <FrameShell
      frameSrc="/images/frames/soul.jpg"
      frameAlt="Soul — Faith. Purpose. Peace. Strengthen your soul within."
      window={{ top: 19, left: 8, width: 84, height: 64 }}
    >
      <h1 className="sr-only">Soul</h1>
      <div className="space-y-3">
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
    </FrameShell>
  )
}
