import Disclosure from '@/components/Disclosure'
import { Utensils, TrendingUp } from 'lucide-react'
import CalorieCounterCard from '@/features/calories/CalorieCounterCard'
import WeeklyNutritionCard from '@/features/calories/WeeklyNutritionCard'

/**
 * Pulled out to its own page — this had grown into the most complex
 * single section in the app (database search, barcode scan, photo
 * estimate, manual entry, plus the weekly review), more than "one
 * collapsible section on Body" really fit. Same treatment Tasks/Habits/
 * Goals/Idea Vault got earlier for the same reason.
 */
export default function CaloriesPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Calorie Counter</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Fuel — search, scan, snap a photo, or log manually.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Log Food" icon={Utensils} defaultOpen>
          <CalorieCounterCard />
        </Disclosure>

        <Disclosure title="Weekly Nutrition Summary" subtitle="Real stats + an honest AI take" icon={TrendingUp} defaultOpen>
          <WeeklyNutritionCard />
        </Disclosure>
      </div>
    </div>
  )
}
