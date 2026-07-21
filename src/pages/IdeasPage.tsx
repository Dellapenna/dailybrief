import PillarHero from '@/components/PillarHero'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'

export default function IdeasPage() {
  return (
    <div>
      <PillarHero slug="idea-vault" alt="Idea Vault" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Idea Vault</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Capture. Explore. Innovate.</p>
      <div className="mt-4">
        <IdeaVaultSection />
      </div>
    </div>
  )
}
