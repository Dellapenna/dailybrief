import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import MissionControlPage from '@/pages/MissionControlPage'
import DailyDashboardPage from '@/pages/DailyDashboardPage'
import GoalsPage from '@/pages/GoalsPage'
import HabitsPage from '@/pages/HabitsPage'
import TasksPage from '@/pages/TasksPage'
import IdeasPage from '@/pages/IdeasPage'
import ReviewsPage from '@/pages/ReviewsPage'
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
 * v8: retired Body/Mind/Soul as separate destinations entirely, per
 * direct feedback they weren't earning visits as pages. Their content
 * split by function instead: "do" content (Exercise Log, Prayer,
 * Communication Journal, etc.) consolidated into Mission Control's new
 * pillar-tabbed "Practices" section; "read" content (Health Trends,
 * Spanish, Stoic Wisdom) into Daily Dashboard's new "Reflect & Learn".
 * /body, /mind, /soul now redirect to /mission-control rather than
 * 404ing, for anyone with old muscle memory. BodyPage.tsx/MindPage.tsx/
 * SoulPage.tsx kept but unused, in case worth revisiting.
 *
 * v7: removed the tappable nav map (NavMapPage) entirely, per direct
 * feedback that it didn't add real value once Mission Control/Daily
 * Dashboard were the primary destinations — "/" now redirects straight
 * to Mission Control instead of an extra tap-through step.
 *
 * v6 (organization/complexity pass): removed the 10 standalone single-
 * topic pages (Calendar, Horoscope, News, Progress, Sports, Stocks,
 * Motivation, Word of the Day, Fun Fact, Dad Joke) that hadn't been
 * linked from anywhere since the pillar consolidation — their content
 * still lives on Daily Dashboard / Mind via the same underlying
 * *Card components, just not as separate routes.
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
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/ideas" element={<IdeasPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/calories" element={<CaloriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
