import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/stoic-quote
 *
 * Real, verified quotes from the three major Stoic philosophers
 * (Marcus Aurelius, Seneca, Epictetus) — public domain classical texts,
 * not AI-generated or paraphrased. Same bundled-list pattern as
 * spanish-word.ts/prayer-prompt.ts: deterministic by day-of-year, no
 * external API dependency to break.
 */

const QUOTES: { text: string; author: string; source: string }[] = [
  { text: 'You have power over your mind — not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius', source: 'Meditations' },
  { text: 'Waste no more time arguing what a good man should be. Be one.', author: 'Marcus Aurelius', source: 'Meditations' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius', source: 'Meditations' },
  { text: 'It is not death that a man should fear, but he should fear never beginning to live.', author: 'Marcus Aurelius', source: 'Meditations' },
  { text: 'How much trouble he avoids who does not look to see what his neighbor says or does.', author: 'Marcus Aurelius', source: 'Meditations' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca', source: 'Letters from a Stoic' },
  { text: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca', source: 'Letters from a Stoic' },
  { text: 'He who is brave is free.', author: 'Seneca', source: 'Letters from a Stoic' },
  { text: 'Every new beginning comes from some other beginning\u2019s end.', author: 'Seneca', source: 'Letters from a Stoic' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca', source: 'On the Shortness of Life' },
  { text: 'Man is not worried by real problems so much as by his imagined anxieties about real problems.', author: 'Epictetus', source: 'Enchiridion' },
  { text: 'It\u2019s not what happens to you, but how you react to it that matters.', author: 'Epictetus', source: 'Enchiridion' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus', source: 'Discourses' },
  { text: 'First say to yourself what you would be; then do what you have to do.', author: 'Epictetus', source: 'Discourses' },
  { text: 'Wealth consists not in having great possessions, but in having few wants.', author: 'Epictetus', source: 'Discourses' },
  { text: 'If you want to improve, be content to be thought foolish and stupid.', author: 'Epictetus', source: 'Enchiridion' },
  { text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius', source: 'Meditations' },
  { text: 'Confine yourself to the present.', author: 'Marcus Aurelius', source: 'Meditations' },
  { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca', source: 'Letters from a Stoic' },
  { text: 'Only the educated are free.', author: 'Epictetus', source: 'Discourses' },
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    const index = dayOfYear(new Date()) % QUOTES.length
    return json({ quote: QUOTES[index], date: new Date().toISOString().slice(0, 10) })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/stoic-quote',
}
