import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'

export default function IdeasPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Idea Vault</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Capture ideas without turning all of them into projects.</p>
      <div className="mt-4">
        <IdeaVaultSection />
      </div>
    </div>
  )
}
