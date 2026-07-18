import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-rdp-text">Page not found</h1>
      <p className="mt-2 text-sm text-rdp-text-dim">
        <Link to="/mission-control" className="text-rdp-signal underline">
          Return to Mission Control
        </Link>
      </p>
    </div>
  )
}
