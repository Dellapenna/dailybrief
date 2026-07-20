import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/communication-tip
 *
 * Same pattern as spanish-word.ts / prayer-prompt.ts — a bundled,
 * curated list rather than an external API, deterministic by
 * day-of-year. Passive/light — the real skill-building happens in the
 * Communication Practice Journal (communication-log.ts), this is just
 * inspiration on top.
 */

const TIPS: string[] = [
  'Ask one more question than feels natural before offering your opinion.',
  'When someone is venting, resist the urge to problem-solve until they ask for it.',
  'State your main point first, then explain — not the other way around.',
  'Repeat back what you heard before responding to it, especially in tense moments.',
  'Silence after a question is not your cue to fill it — let them think.',
  'Replace "you always" or "you never" with what specifically happened this time.',
  'In a disagreement, name what you agree on before you name what you do not.',
  'Say the hard thing earlier in the conversation, not buried at the end.',
  'Match your tone to the moment — not every update needs enthusiasm, not every problem needs alarm.',
  'Ask "what would be helpful right now?" instead of assuming they want advice.',
  'When giving feedback, lead with the specific behavior, not the general trait.',
  'Notice when you are listening to respond rather than listening to understand.',
  'A clear "no" respects people more than a vague "maybe" that wastes their time.',
  'Before a hard conversation, decide the one thing you actually need them to hear.',
  'Eye contact and an open posture say more than most of what you plan to say.',
  'When you do not understand, say so plainly instead of nodding along.',
  'Give credit specifically and publicly; give correction specifically and privately.',
  'Ask what success looks like to them before assuming it matches your definition.',
  'Notice if you are explaining yourself more than you are listening.',
  'End meetings by stating out loud what was decided and who owns what next.',
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    const index = dayOfYear(new Date()) % TIPS.length
    return json({ tip: TIPS[index], date: new Date().toISOString().slice(0, 10) })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/communication-tip',
}
