/**
 * Computes "today" (YYYY-MM-DD) in a specific IANA timezone, rather than
 * server UTC time. Using `new Date().toISOString().slice(0, 10)`
 * silently computes the UTC date — for a US-based user in the evening,
 * UTC has often already rolled over to "tomorrow," so daily-reset
 * features (habit completion, check-ins, evening review) can appear to
 * not reset, or reset several hours early/late, depending on the user's
 * actual local time. en-CA locale formats as YYYY-MM-DD, matching our
 * date columns directly.
 */
export function todayInTimezone(timeZone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}
