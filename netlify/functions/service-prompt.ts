import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/service-prompt
 * Same pattern as prayer-prompt.ts / gratitude-prompt.ts.
 */

const PROMPTS = [
  'Who could use a small act of help from you today, without being asked?',
  'Is there someone you have been meaning to check on? Reach out today.',
  'What is one thing you could do today that makes someone else\'s day easier?',
  'Who on your team or in your family is carrying more than their share right now?',
  'Is there a kindness someone showed you that you could pass along today?',
  'What is a way you could give your time, not just your money, today?',
  'Who might need encouragement more than advice from you right now?',
  'Is there someone you could genuinely listen to today, without fixing anything?',
  'What is a small burden you could lift for someone else today?',
  'Who taught or mentored you that you could thank, directly, today?',
  'Is there someone outside your usual circle you could include today?',
  'What is a way you could serve your family specifically today, not just provide for them?',
  'Who might be struggling quietly that you could check on today?',
  'What is one thing you could do for your community this week, even a small one?',
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
  path: '/api/service-prompt',
}
