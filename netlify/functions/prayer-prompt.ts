import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/prayer-prompt
 *
 * Short, denomination-neutral reflection cues (gratitude, guidance,
 * others, etc.) — not a substitute for anyone's actual faith practice or
 * tradition, just a gentle daily nudge to pause. Deterministic by
 * day-of-year, same reasoning as spanish-word.ts.
 */

const PROMPTS = [
  'Take a moment to give thanks — what are you grateful for today?',
  'Ask for guidance on a decision or challenge in front of you.',
  'Hold someone else in your thoughts today — who needs it?',
  'Reflect on where you fell short recently, and let it go.',
  'Ask for strength and patience for what today holds.',
  'Think of someone who helped shape who you are — give thanks for them.',
  'Sit quietly for a moment before the day takes over.',
  'Ask for peace in a situation that has been weighing on you.',
  'Reflect on a small mercy or grace you received recently.',
  'Pray for your family — by name, one at a time.',
  'Ask for wisdom in how you lead or serve others today.',
  'Consider what you are carrying that you could set down today.',
  'Give thanks for your health and the ability to do the work in front of you.',
  'Ask for courage to do the harder right thing today, not the easier wrong one.',
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    const index = dayOfYear(new Date()) % PROMPTS.length
    return json({ prompt: PROMPTS[index], date: new Date().toISOString().slice(0, 10) })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/prayer-prompt',
}
