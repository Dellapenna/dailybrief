import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import NavMapPage from '@/pages/NavMapPage'
import MissionControlPage from '@/pages/MissionControlPage'
import DailyDashboardPage from '@/pages/DailyDashboardPage'
import BodyPage from '@/pages/BodyPage'
import MindPage from '@/pages/MindPage'
import SoulPage from '@/pages/SoulPage'
import GoalsPage from '@/pages/GoalsPage'
import HabitsPage from '@/pages/HabitsPage'
import TasksPage from '@/pages/TasksPage'
import IdeasPage from '@/pages/IdeasPage'
import ReviewsPage from '@/pages/ReviewsPage'
import SettingsPage from '@/pages/SettingsPage'
import MorePage from '@/pages/MorePage'
import NotFoundPage from '@/pages/NotFoundPage'

/**
 * No login/auth routes: access control for this single-user instance is
 * Netlify Password Protection at the site level (Netlify dashboard, not
 * code — see docs/INTEGRATIONS.md). Every route below is reachable once
 * past that gate; there's no second in-app login layer.
 *
 * v6 (organization/complexity pass): removed the 10 standalone single-
 * topic pages (Calendar, Horoscope, News, Progress, Sports, Stocks,
 * Motivation, Word of the Day, Fun Fact, Dad Joke) that hadn't been
 * linked from anywhere since the pillar consolidation — their content
 * still lives on Daily Dashboard / Mind via the same underlying
 * *Card components, just not as separate routes. Every remaining route
 * here is reachable from the nav map, sidebar, mobile nav, or More.
 */
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<NavMapPage />} />
        <Route path="/mission-control" element={<MissionControlPage />} />
        <Route path="/daily-dashboard" element={<DailyDashboardPage />} />
        <Route path="/briefing" element={<Navigate to="/daily-dashboard" replace />} />
        <Route path="/body" element={<BodyPage />} />
        <Route path="/mind" element={<MindPage />} />
        <Route path="/soul" element={<SoulPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/ideas" element={<IdeasPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
