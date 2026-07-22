import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import MissionControlPage from '@/pages/MissionControlPage'
import DailyDashboardPage from '@/pages/DailyDashboardPage'
import HabitsPage from '@/pages/HabitsPage'
import TasksPage from '@/pages/TasksPage'
import IdeasPage from '@/pages/IdeasPage'
import CaloriesPage from '@/pages/CaloriesPage'
import SettingsPage from '@/pages/SettingsPage'
import MorePage from '@/pages/MorePage'
import NotFoundPage from '@/pages/NotFoundPage'

/**
 * No login/auth routes: access control for this single-user instance is
 * Netlify Password Protection at the site level (Netlify dashboard, not
 * code — see docs/INTEGRATIONS.md). Every route below is reachable once
 * past that gate; there's no second in-app login layer.
 *
 * v10: Idea Vault un-retired as its own page again — was folded into
 * Habits & Logbook's Mind practices in v9, but per direct request (new
 * header art incoming) it's back to being a real destination. /ideas no
 * longer redirects.
 *
 * v9: full-structure pass after several incremental moves in a row
 * stopped adding up to something coherent (Idea Vault/Evening Review/
 * Goals each had two homes; Habit Ideas was split from the habit list
 * it suggests for). Retired /goals, /ideas, /reviews as separate pages
 * — each now redirects to its one real home instead of 404ing:
 * /goals → /mission-control (Goals lives there, always did),
 * /ideas and /reviews → /habits (Idea Vault and Evening Review are
 * Practice cards there now, renamed "Habits & Practices" since that's a
 * more honest name for what's actually on that page). Habit Ideas moved
 * from Mission Control's Insights to Habits & Practices, so suggesting
 * a habit and adding it happen in the same place.
 *
 * v8: retired Body/Mind/Soul as separate destinations entirely, per
 * direct feedback they weren't earning visits as pages. Their content
 * split by function instead: "do" content into Mission Control's
 * Practices (later moved to Habits & Practices, see v9); "read" content
 * (Health Trends, Spanish, Stoic Wisdom) into Daily Dashboard's
 * "Reflect & Learn". /body, /mind, /soul redirect to /mission-control.
 * BodyPage.tsx/MindPage.tsx/SoulPage.tsx kept but unused.
 *
 * v7: removed the tappable nav map (NavMapPage) entirely — "/" now
 * redirects straight to Mission Control.
 *
 * v6: removed the 10 standalone single-topic pages (Calendar, Horoscope,
 * News, Progress, Sports, Stocks, Motivation, Word of the Day, Fun Fact,
 * Dad Joke) that hadn't been linked from anywhere since the pillar
 * consolidation — their content lives on Daily Dashboard via the same
 * underlying *Card components, just not as separate routes.
 */
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/mission-control" replace />} />
        <Route path="/mission-control" element={<MissionControlPage />} />
        <Route path="/daily-dashboard" element={<DailyDashboardPage />} />
        <Route path="/briefing" element={<Navigate to="/daily-dashboard" replace />} />
        <Route path="/body" element={<Navigate to="/mission-control" replace />} />
        <Route path="/mind" element={<Navigate to="/mission-control" replace />} />
        <Route path="/soul" element={<Navigate to="/mission-control" replace />} />
        <Route path="/goals" element={<Navigate to="/mission-control" replace />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/ideas" element={<IdeasPage />} />
        <Route path="/reviews" element={<Navigate to="/habits" replace />} />
        <Route path="/calories" element={<CaloriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
