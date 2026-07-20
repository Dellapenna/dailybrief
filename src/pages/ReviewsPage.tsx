import FrameShell from '@/components/FrameShell'
import EveningReviewForm from '@/features/eveningReview/EveningReviewForm'

export default function ReviewsPage() {
  return (
    <FrameShell
      frameSrc="/images/frames/reviews.jpg"
      frameAlt="Reviews — Your feedback. Our treasure."
      window={{ top: 19, left: 8, width: 84, height: 64 }}
    >
      <h1 className="sr-only">Reviews</h1>
      <EveningReviewForm />
    </FrameShell>
  )
}
