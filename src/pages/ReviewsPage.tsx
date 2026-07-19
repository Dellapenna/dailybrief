import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'

export default function ReviewsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Reviews</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">
        The Weekly Presidential Brief comes later (Phase 6) — for now, the daily Evening Close.
      </p>

      <div className="mt-6">
        <EveningReviewForm />
      </div>
    </div>
  )
}
