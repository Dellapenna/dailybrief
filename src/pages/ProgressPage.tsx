import MissionProgress from '@/features/dashboard/MissionProgress'

export default function ProgressPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Progress</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Track it. See it grow.</p>
      <div className="mt-4">
        <MissionProgress />
      </div>
    </div>
  )
}
