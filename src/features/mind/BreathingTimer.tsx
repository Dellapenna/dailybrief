import { useEffect, useRef, useState } from 'react'
import { useHabitByName } from '@/features/habits/useHabitByName'

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdEmpty'

const PATTERNS: Record<string, { label: string; phases: { phase: Phase; seconds: number }[] }> = {
  box: {
    label: 'Box (4-4-4-4)',
    phases: [
      { phase: 'inhale', seconds: 4 },
      { phase: 'hold', seconds: 4 },
      { phase: 'exhale', seconds: 4 },
      { phase: 'holdEmpty', seconds: 4 },
    ],
  },
  '478': {
    label: '4-7-8',
    phases: [
      { phase: 'inhale', seconds: 4 },
      { phase: 'hold', seconds: 7 },
      { phase: 'exhale', seconds: 8 },
    ],
  },
  simple: {
    label: 'Simple (4-4)',
    phases: [
      { phase: 'inhale', seconds: 4 },
      { phase: 'exhale', seconds: 4 },
    ],
  },
}

const PHASE_LABEL: Record<Phase, string> = {
  inhale: 'Breathe in',
  hold: 'Hold',
  exhale: 'Breathe out',
  holdEmpty: 'Hold',
}

const TOTAL_CYCLES = 4

export default function BreathingTimer() {
  const { habit, loading, toggleToday } = useHabitByName('mind', 'Breathing Meditation')
  const [patternKey, setPatternKey] = useState<keyof typeof PATTERNS>('box')
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [cycle, setCycle] = useState(0)
  const timerRef = useRef<number | null>(null)

  const pattern = PATTERNS[patternKey]
  const currentPhase = pattern.phases[phaseIndex]

  useEffect(() => {
    if (!running) return

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1

        setPhaseIndex((pi) => {
          const nextIndex = (pi + 1) % pattern.phases.length
          if (nextIndex === 0) {
            setCycle((c) => {
              const nextCycle = c + 1
              if (nextCycle >= TOTAL_CYCLES) {
                setRunning(false)
              }
              return nextCycle
            })
          }
          setSecondsLeft(pattern.phases[nextIndex].seconds)
          return nextIndex
        })
        return s
      })
    }, 1000)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, patternKey])

  function start() {
    setPhaseIndex(0)
    setSecondsLeft(pattern.phases[0].seconds)
    setCycle(0)
    setRunning(true)
  }

  function stop() {
    setRunning(false)
  }

  const done = cycle >= TOTAL_CYCLES

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        Breathing Meditation
      </p>

      {!running && !done && (
        <div className="mt-3 flex gap-2">
          {Object.entries(PATTERNS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setPatternKey(key as keyof typeof PATTERNS)}
              className={`rounded-lg border px-2 py-1 text-xs ${
                patternKey === key ? 'border-rdp-signal text-rdp-signal' : 'border-rdp-line text-rdp-text-dim'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col items-center justify-center py-4">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-rdp-signal transition-transform duration-1000 ease-in-out"
          style={{
            transform:
              running && (currentPhase.phase === 'inhale' || currentPhase.phase === 'hold') ? 'scale(1.15)' : 'scale(0.85)',
          }}
        >
          <span className="font-mono text-2xl tabular-nums text-rdp-text">{running ? secondsLeft : ''}</span>
        </div>
        <p className="mt-3 font-display text-sm text-rdp-text">
          {done ? 'Nicely done.' : running ? PHASE_LABEL[currentPhase.phase] : 'Ready when you are'}
        </p>
        {running && <p className="mt-1 font-mono text-xs text-rdp-text-faint">cycle {cycle + 1}/{TOTAL_CYCLES}</p>}
      </div>

      {!running && !done && (
        <button onClick={start} className="w-full rounded-lg bg-rdp-signal px-3 py-2 text-sm font-medium text-white">
          Start
        </button>
      )}
      {running && (
        <button
          onClick={stop}
          className="w-full rounded-lg border border-rdp-line px-3 py-2 text-sm font-medium text-rdp-text-dim"
        >
          Stop
        </button>
      )}

      {!loading && habit && (
        <div className="mt-3 flex items-center justify-between">
          <p className="font-mono text-xs tabular-nums text-rdp-text-faint">
            streak {habit.currentStreak}d · best {habit.longestStreak}d
          </p>
          <button
            onClick={() => toggleToday(habit)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              habit.completedToday
                ? 'border-rdp-good bg-rdp-good/15 text-rdp-good'
                : 'border-rdp-line text-rdp-text-dim hover:border-rdp-signal'
            }`}
          >
            {habit.completedToday ? 'Done today ✓' : 'Mark as done'}
          </button>
        </div>
      )}
    </div>
  )
}
