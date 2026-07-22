import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import { Utensils, TrendingUp, Droplet, Dumbbell } from 'lucide-react'
import CalorieCounterCard from '@/features/calories/CalorieCounterCard'
import WeeklyNutritionCard from '@/features/calories/WeeklyNutritionCard'
import WaterTrackerCard from '@/features/water/WaterTrackerCard'
import ExerciseLogCard from '@/features/exercise/ExerciseLogCard'

/**
 * Pulled out to its own page — this had grown into the most complex
 * single section in the app (database search, barcode scan, photo
 * estimate, manual entry, plus the weekly review), more than "one
 * collapsible section on Body" really fit. Same treatment Tasks/Habits/
 * Goals/Idea Vault got earlier for the same reason.
 *
 * Exercise Log moved here from Habits & Logbook — calories burned
 * directly feeds this page's daily budget now, makes more sense living
 * together than split across two pages.
 */
export default function CaloriesPage() {
  return (
    <div>
      <PillarHero slug="calories" alt="Calorie Counter" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Calorie Counter</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Fuel — search, scan, snap a photo, or log manually.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Log Food" icon={Utensils} defaultOpen>
          <CalorieCounterCard />
        </Disclosure>

        <Disclosure title="Water" subtitle="Tap a glass to log 8oz" icon={Droplet} defaultOpen>
          <WaterTrackerCard />
        </Disclosure>

        <Disclosure title="Weekly Nutrition Summary" subtitle="Real stats + an honest AI take" icon={TrendingUp} defaultOpen>
          <WeeklyNutritionCard />
        </Disclosure>

        <Disclosure title="Exercise Log" subtitle="Earns calories back toward today's budget" icon={Dumbbell} defaultOpen>
          <ExerciseLogCard />
        </Disclosure>
      </div>
    </div>
  )
}
