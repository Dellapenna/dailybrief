import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import TabbedCard from '@/components/TabbedCard'
import { Languages, Wind, MessageCircle, Lightbulb } from 'lucide-react'
import SpanishWordCard from '@/features/spanish/SpanishWordCard'
import CommunicationTipCard from '@/features/communication/CommunicationTipCard'
import BreathingTimer from '@/features/mind/BreathingTimer'
import CommunicationJournalCard from '@/features/communication/CommunicationJournalCard'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'

/**
 * Motivation Quote and Word of the Day moved to Daily Dashboard — the
 * new reference map explicitly lists both under Daily Dashboard, not
 * Mind, joining Fun Fact/Dad Joke which were already there. Spanish and
 * the Communication Tip stayed here since they're more skill-building
 * than pure "read for fun," and the map doesn't suggest moving them.
 * Habits (including Spanish practice) and Tasks/Goals moved to Mission
 * Control's consolidated all-pillars view with a pillar selector per
 * row, per direct request.
 */
export default function MindPage() {
  return (
    <div>
      <PillarHero slug="mind" alt="Mind" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Mind</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Focus. Learn. Grow. Sharpen your mind every day.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Daily Reads" subtitle="Spanish, Communication Tip" icon={Languages} defaultOpen>
          <TabbedCard
            tabs={[
              { label: 'Spanish', content: <SpanishWordCard /> },
              { label: 'Comm. Tip', content: <CommunicationTipCard /> },
            ]}
          />
        </Disclosure>

        <Disclosure title="Meditate" subtitle="Breathing Meditation" icon={Wind} defaultOpen>
          <BreathingTimer />
        </Disclosure>

        <Disclosure
          title="Communication Practice Journal"
          subtitle="Log real interactions, reflect"
          icon={MessageCircle}
          defaultOpen
        >
          <CommunicationJournalCard />
        </Disclosure>

        <Disclosure title="Idea Vault" icon={Lightbulb} defaultOpen>
          <IdeaVaultSection />
        </Disclosure>
      </div>
    </div>
  )
}
