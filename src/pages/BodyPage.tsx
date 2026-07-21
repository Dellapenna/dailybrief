import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import { Dumbbell, Activity, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import ExerciseLogCard from '@/features/exercise/ExerciseLogCard'
import HealthTrends from '@/features/exercise/HealthTrends'

/**
 * Habits moved to Mission Control's consolidated all-pillars view (with
 * a pillar selector per row). Tasks/Goals moved there too, same
 * treatment, per direct request. Calorie Counter + Weekly Nutrition
 * Summary got pulled out to their own dedicated page (/calories) since
 * that section had grown into the most complex single piece of the app
 * (search, barcode scan, photo estimate, manual entry, weekly review) —
 * more than "one collapsible section among several" really fit.
 */
export default function BodyPage() {
  return (
    <div>
      <PillarHero slug="body" alt="Body" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Body</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Train. Fuel. Recover. Optimize your physical potential.</p>

      <Link
        to="/calories"
        className="mt-3 flex items-center gap-2 rounded-xl border border-rdp-line bg-rdp-panel px-4 py-3 text-sm text-rdp-signal hover:bg-rdp-void"
      >
        <Utensils className="h-4 w-4" />
        Calorie Counter moved here — tap to open
      </Link>

      <div className="mt-3 space-y-3">
        <Disclosure title="Exercise Log" subtitle="Strength, aerobic, stretching" icon={Dumbbell} defaultOpen>
          <ExerciseLogCard />
        </Disclosure>

        <Disclosure title="Health Trends" subtitle="Sleep, energy, weight over time" icon={Activity} defaultOpen>
          <HealthTrends />
        </Disclosure>
      </div>
    </div>
  )
}
