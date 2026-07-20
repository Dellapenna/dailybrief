import FrameShell from '@/components/FrameShell'
import IdeaVaultSection from '@/features/ideas/IdeaVaultSection'

export default function IdeasPage() {
  return (
    <FrameShell
      frameSrc="/images/frames/idea-vault.jpg"
      frameAlt="Idea Vault — Capture. Explore. Innovate."
      window={{ top: 19, left: 8, width: 84, height: 64 }}
    >
      <h1 className="sr-only">Idea Vault</h1>
      <IdeaVaultSection />
    </FrameShell>
  )
}
