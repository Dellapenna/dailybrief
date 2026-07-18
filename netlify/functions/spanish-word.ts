import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/spanish-word
 *
 * A bundled, curated list rather than a free translation API — those
 * are often unreliable for word-of-the-day use (rate limits, spotty
 * uptime), and this is genuinely simpler: every entry here is a real,
 * correctly-translated common Spanish word/phrase, so there's no
 * fabrication risk and no external dependency to break. Deterministic
 * by day-of-year so it's stable all day and cycles through the list
 * before repeating.
 */

const WORDS: { es: string; en: string; example?: string; exampleEn?: string }[] = [
  { es: 'el hogar', en: 'home', example: 'Vuelvo a mi hogar.', exampleEn: 'I return to my home.' },
  { es: 'la familia', en: 'family', example: 'Mi familia es grande.', exampleEn: 'My family is big.' },
  { es: 'el trabajo', en: 'work / job', example: 'Voy al trabajo temprano.', exampleEn: 'I go to work early.' },
  { es: 'la meta', en: 'goal', example: 'Mi meta es correr un maratón.', exampleEn: 'My goal is to run a marathon.' },
  { es: 'el hábito', en: 'habit', example: 'Formar un hábito toma tiempo.', exampleEn: 'Forming a habit takes time.' },
  { es: 'agradecido/a', en: 'grateful', example: 'Estoy agradecido por hoy.', exampleEn: "I'm grateful for today." },
  { es: 'la fuerza', en: 'strength', example: 'Necesito más fuerza.', exampleEn: 'I need more strength.' },
  { es: 'el descanso', en: 'rest', example: 'El descanso es importante.', exampleEn: 'Rest is important.' },
  { es: 'la paciencia', en: 'patience', example: 'Ten paciencia contigo mismo.', exampleEn: 'Have patience with yourself.' },
  { es: 'el propósito', en: 'purpose', example: 'Vivo con propósito.', exampleEn: 'I live with purpose.' },
  { es: 'mañana', en: 'tomorrow / morning', example: 'Nos vemos mañana.', exampleEn: 'See you tomorrow.' },
  { es: 'ahora', en: 'now', example: 'Empieza ahora.', exampleEn: 'Start now.' },
  { es: 'siempre', en: 'always', example: 'Siempre hay una manera.', exampleEn: "There's always a way." },
  { es: 'el éxito', en: 'success', example: 'El éxito toma tiempo.', exampleEn: 'Success takes time.' },
  { es: 'el reto', en: 'challenge', example: 'Acepto el reto.', exampleEn: 'I accept the challenge.' },
  { es: 'la salud', en: 'health', example: 'La salud es lo primero.', exampleEn: 'Health comes first.' },
  { es: 'el corazón', en: 'heart', example: 'Lo hago de corazón.', exampleEn: 'I do it from the heart.' },
  { es: 'la mente', en: 'mind', example: 'Una mente tranquila.', exampleEn: 'A calm mind.' },
  { es: 'el equilibrio', en: 'balance', example: 'Busco equilibrio en mi vida.', exampleEn: 'I seek balance in my life.' },
  { es: 'la disciplina', en: 'discipline', example: 'La disciplina vence a la duda.', exampleEn: 'Discipline beats doubt.' },
  { es: 'el amigo / la amiga', en: 'friend', example: 'Es un buen amigo.', exampleEn: "He's a good friend." },
  { es: 'aprender', en: 'to learn', example: 'Me gusta aprender cosas nuevas.', exampleEn: 'I like learning new things.' },
  { es: 'crecer', en: 'to grow', example: 'Quiero crecer cada día.', exampleEn: 'I want to grow every day.' },
  { es: 'lograr', en: 'to achieve', example: 'Puedo lograrlo.', exampleEn: 'I can achieve it.' },
  { es: 'confiar', en: 'to trust', example: 'Confío en el proceso.', exampleEn: 'I trust the process.' },
  { es: 'el viaje', en: 'trip / journey', example: 'La vida es un viaje.', exampleEn: 'Life is a journey.' },
  { es: 'el tiempo', en: 'time / weather', example: 'No hay tiempo que perder.', exampleEn: 'No time to lose.' },
  { es: 'temprano', en: 'early', example: 'Me levanto temprano.', exampleEn: 'I wake up early.' },
  { es: 'ocupado/a', en: 'busy', example: 'Hoy estoy muy ocupado.', exampleEn: "Today I'm very busy." },
  { es: 'tranquilo/a', en: 'calm', example: 'Mantente tranquilo.', exampleEn: 'Stay calm.' },
  { es: 'el orgullo', en: 'pride', example: 'Lo hice con orgullo.', exampleEn: 'I did it with pride.' },
  { es: 'valiente', en: 'brave', example: 'Sé valiente hoy.', exampleEn: 'Be brave today.' },
  { es: 'el sueño', en: 'dream / sleep', example: 'Sigue tus sueños.', exampleEn: 'Follow your dreams.' },
  { es: 'la esperanza', en: 'hope', example: 'Nunca pierdas la esperanza.', exampleEn: 'Never lose hope.' },
  { es: 'el esfuerzo', en: 'effort', example: 'Vale la pena el esfuerzo.', exampleEn: "The effort is worth it." },
  { es: 'mejorar', en: 'to improve', example: 'Quiero mejorar cada semana.', exampleEn: 'I want to improve every week.' },
  { es: 'el liderazgo', en: 'leadership', example: 'El liderazgo empieza en casa.', exampleEn: 'Leadership starts at home.' },
  { es: 'la decisión', en: 'decision', example: 'Es tu decisión.', exampleEn: "It's your decision." },
  { es: 'enfocado/a', en: 'focused', example: 'Estoy enfocado en mi meta.', exampleEn: "I'm focused on my goal." },
  { es: 'el equipo', en: 'team', example: 'Somos un buen equipo.', exampleEn: "We're a good team." },
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    const index = dayOfYear(new Date()) % WORDS.length
    return json({ word: WORDS[index], date: new Date().toISOString().slice(0, 10) })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/spanish-word',
}
