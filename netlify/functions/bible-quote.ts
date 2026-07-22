import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/bible-quote
 *
 * Real verses from the King James Version — public domain (1611),
 * quoted directly rather than paraphrased or AI-generated. Same
 * bundled-list, deterministic-by-day pattern as stoic-quote.ts.
 */

const VERSES: { text: string; reference: string }[] = [
  { text: 'I can do all things through Christ which strengtheneth me.', reference: 'Philippians 4:13' },
  { text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', reference: 'Proverbs 3:5' },
  { text: 'Be still, and know that I am God.', reference: 'Psalm 46:10' },
  { text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.', reference: 'Jeremiah 29:11' },
  { text: 'And we know that all things work together for good to them that love God.', reference: 'Romans 8:28' },
  { text: 'Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee.', reference: 'Deuteronomy 31:6' },
  { text: 'The LORD is my shepherd; I shall not want.', reference: 'Psalm 23:1' },
  { text: 'Cast thy burden upon the LORD, and he shall sustain thee.', reference: 'Psalm 55:22' },
  { text: 'Let us not be weary in well doing: for in due season we shall reap, if we faint not.', reference: 'Galatians 6:9' },
  { text: 'This is the day which the LORD hath made; we will rejoice and be glad in it.', reference: 'Psalm 118:24' },
  { text: 'Commit thy way unto the LORD; trust also in him; and he shall bring it to pass.', reference: 'Psalm 37:5' },
  { text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God.', reference: 'Isaiah 41:10' },
  { text: 'A merry heart doeth good like a medicine: but a broken spirit drieth the bones.', reference: 'Proverbs 17:22' },
  { text: 'Whatsoever thy hand findeth to do, do it with thy might.', reference: 'Ecclesiastes 9:10' },
  { text: 'And let us consider one another to provoke unto love and to good works.', reference: 'Hebrews 10:24' },
  { text: 'Give thanks in every thing: for this is the will of God in Christ Jesus concerning you.', reference: '1 Thessalonians 5:18' },
  { text: 'Be ye kind one to another, tenderhearted, forgiving one another.', reference: 'Ephesians 4:32' },
  { text: 'The LORD is my light and my salvation; whom shall I fear?', reference: 'Psalm 27:1' },
  { text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.', reference: 'Isaiah 40:31' },
  { text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.', reference: '2 Timothy 1:7' },
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    const index = dayOfYear(new Date()) % VERSES.length
    return json({ verse: VERSES[index], date: new Date().toISOString().slice(0, 10) })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/bible-quote',
}
