import CalendarSection from '@/features/calendar/CalendarSection'

export default function CalendarPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Calendar</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">See your day at a glance.</p>
      <div className="mt-4">
        <CalendarSection />
      </div>
    </div>
  )
}
