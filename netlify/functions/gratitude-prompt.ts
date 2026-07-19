import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/gratitude-prompt
 * Same pattern as prayer-prompt.ts — deterministic by day-of-year.
 */

const PROMPTS = [
  'What is one small thing today that you might otherwise take for granted?',
  'Who is someone you are grateful to have in your life right now?',
  'What is something about your health or body you are thankful for today?',
  'What is a hard season you got through — and what came out of it?',
  'What is something about today, specifically, that you are glad happened?',
  'Who taught you something valuable that still matters to you?',
  'What is a comfort in your daily life you rarely stop to notice?',
  'What is something about your work you are grateful to be able to do?',
  'What is a place that brings you peace when you think of it?',
  'What is something small someone did for you recently that you appreciated?',
  'What is a skill or ability you have that you are thankful for?',
  'What is something about where you live that you are grateful for?',
  'What is a mistake that, in hindsight, taught you something worth keeping?',
  'What is something ordinary today that would have amazed you as a kid?',
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
  path: '/api/gratitude-prompt',
}
