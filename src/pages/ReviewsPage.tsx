import PillarHero from '@/components/PillarHero'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'

export default function ReviewsPage() {
  return (
    <div>
      <PillarHero slug="reviews" alt="Reviews" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Reviews</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Your feedback. Our treasure.</p>
      <div className="mt-4">
        <EveningReviewForm />
      </div>
    </div>
  )
}
