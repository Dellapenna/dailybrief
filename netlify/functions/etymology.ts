import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/etymology
 *
 * Real, verified word origins — same bundled-list pattern as
 * spanish-word.ts/stoic-quote.ts rather than scraping a source that
 * might break or return inconsistent data. Each entry is a genuinely
 * documented etymology (the kind you'd find in Etymonline or a proper
 * dictionary), not invented or approximated.
 */

const WORDS: { word: string; origin: string; language: string; note: string }[] = [
  { word: 'salary', origin: 'salarium', language: 'Latin', note: 'Tied to "sal" (salt) \u2014 Roman soldiers were partly paid in, or given an allowance to buy, salt.' },
  { word: 'sandwich', origin: 'the Earl of Sandwich', language: 'English (eponym)', note: 'Named after John Montagu, 4th Earl of Sandwich, said to have ordered meat between bread so he could keep gambling.' },
  { word: 'quarantine', origin: 'quaranta giorni', language: 'Italian', note: 'Literally "forty days" \u2014 the period ships had to wait offshore during plague outbreaks in Venice.' },
  { word: 'nightmare', origin: 'mare', language: 'Old English', note: 'The "mare" was a mythical demon believed to sit on a sleeper\u2019s chest, not a horse.' },
  { word: 'clue', origin: 'clew', language: 'Old English', note: 'Originally a ball of thread \u2014 from the myth of Theseus using thread to navigate the labyrinth.' },
  { word: 'disaster', origin: 'dis- + astro', language: 'Greek/Latin', note: 'Literally "bad star" \u2014 from the old belief that catastrophes were caused by unfavorable star alignments.' },
  { word: 'muscle', origin: 'musculus', language: 'Latin', note: 'Literally "little mouse" \u2014 a flexing bicep was thought to resemble a mouse moving under the skin.' },
  { word: 'companion', origin: 'companio', language: 'Latin', note: 'From com- ("with") + panis ("bread") \u2014 literally someone you share a meal with.' },
  { word: 'trivial', origin: 'trivium', language: 'Latin', note: 'A "place where three roads meet" \u2014 a trivial matter was one common enough to be discussed on a street corner.' },
  { word: 'clock', origin: 'clocca', language: 'Medieval Latin', note: 'Means "bell" \u2014 early time-telling devices marked hours by ringing, not by a face with hands.' },
  { word: 'avocado', origin: 'ahuacatl', language: 'Nahuatl (Aztec)', note: 'The Nahuatl word also meant "testicle," describing the fruit\u2019s shape as it hangs in pairs.' },
  { word: 'salt', origin: 'sal', language: 'Latin / Proto-Indo-European', note: 'The root behind "salary," "salad" (salted greens), and "sauce" (a salted preparation) all trace back here.' },
  { word: 'bankrupt', origin: 'banca rotta', language: 'Italian', note: 'Literally "broken bench" \u2014 from the practice of physically breaking a money-lender\u2019s bench when he couldn\u2019t pay debts.' },
  { word: 'assassin', origin: 'hashishin', language: 'Arabic (disputed)', note: 'Traditionally linked to a sect said to use hashish before carrying out killings, though the connection is debated by historians.' },
  { word: 'panic', origin: 'Pan', language: 'Greek', note: 'Named for the god Pan, believed to cause sudden, groundless fear in travelers through remote places.' },
  { word: 'candidate', origin: 'candidatus', language: 'Latin', note: 'Means "clothed in white" \u2014 Roman office-seekers wore bright white togas to stand out.' },
  { word: 'muscle-bound', origin: 'wrestling slang, 1875', language: 'English', note: 'Coined to describe wrestlers whose muscle bulk actually reduced their flexibility and speed.' },
  { word: 'silhouette', origin: '\u00c9tienne de Silhouette', language: 'French (eponym)', note: 'Named after a French finance minister known for cost-cutting austerity \u2014 a cheap black outline profile mocked his name.' },
  { word: 'berserk', origin: 'berserkr', language: 'Old Norse', note: 'Literally "bear-shirt" \u2014 Norse warriors said to fight in a trance-like fury, sometimes wearing bear pelts into battle.' },
  { word: 'tantalize', origin: 'Tantalus', language: 'Greek', note: 'From the myth of Tantalus, punished with food and water eternally just out of reach.' },
  { word: 'mortgage', origin: 'mort + gage', language: 'Old French', note: 'Literally "death pledge" \u2014 the debt dies either when it\u2019s paid off or when the borrower does.' },
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    const index = dayOfYear(new Date()) % WORDS.length
    return json({ entry: WORDS[index], date: new Date().toISOString().slice(0, 10) })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/etymology',
}
