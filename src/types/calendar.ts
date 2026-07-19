export type CalendarProvider = 'icloud' | 'google' | 'outlook'

export type CalendarEvent = {
  id: string
  provider: CalendarProvider
  title: string
  location: string | null
  starts_at: string
  ends_at: string | null
  all_day: boolean
}

export type CalendarConnection = {
  provider: CalendarProvider
  status: 'disconnected' | 'connected' | 'error'
  last_synced_at: string | null
  last_error: string | null
}
