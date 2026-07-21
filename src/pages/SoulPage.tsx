import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import { Sparkles, Heart, Moon, HeartHandshake } from 'lucide-react'
import PrayerCard from '@/features/soul/PrayerCard'
import GratitudeCard from '@/features/soul/GratitudeCard'
import ServiceCard from '@/features/soul/ServiceCard'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'

/** Tasks/Goals moved to Mission Control's consolidated all-pillars view, per direct request. */
export default function SoulPage() {
  return (
    <div>
      <PillarHero slug="soul" alt="Soul" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Soul</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Faith. Purpose. Peace. Strengthen your soul within.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Faith" subtitle="Prayer" icon={Sparkles} defaultOpen>
          <PrayerCard />
        </Disclosure>

        <Disclosure title="Gratitude" icon={Heart} defaultOpen>
          <GratitudeCard />
        </Disclosure>

        <Disclosure title="Reflection" subtitle="Evening Review" icon={Moon} defaultOpen>
          <EveningReviewForm />
        </Disclosure>

        <Disclosure title="Service" icon={HeartHandshake} defaultOpen>
          <ServiceCard />
        </Disclosure>
      </div>
    </div>
  )
}
