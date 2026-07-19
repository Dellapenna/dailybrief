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
import CalendarPage from '@/pages/CalendarPage'
import HoroscopePage from '@/pages/HoroscopePage'
import NewsPage from '@/pages/NewsPage'
import ProgressPage from '@/pages/ProgressPage'
import SportsPage from '@/pages/SportsPage'
import StocksPage from '@/pages/StocksPage'
import MotivationPage from '@/pages/MotivationPage'
import WordOfDayPage from '@/pages/WordOfDayPage'
import FunFactPage from '@/pages/FunFactPage'
import DadJokePage from '@/pages/DadJokePage'
import NotFoundPage from '@/pages/NotFoundPage'

/**
 * No login/auth routes: access control for this single-user instance is
 * Netlify Password Protection at the site level (Netlify dashboard, not
 * code — see docs/INTEGRATIONS.md). Every route below is reachable once
 * past that gate; there's no second in-app login layer.
 *
 * v5: consolidated from 7 pillars down to 4 zones (Body/Mind/Soul/
 * Mission Control) plus Daily Dashboard as a separate 5th destination —
 * per the "let's brainstorm" conversation. Mission Control is now
 * goals/planning/execution/Executive Summary; Daily Dashboard is today's
 * info + check-in (what Mission Control used to be). Old /spirit, /life,
 * /work, /intelligence routes are gone — content was redistributed, not
 * hidden behind a redirect, since there's no clean 1:1 replacement page
 * for any of them individually.
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
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/horoscope" element={<HoroscopePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/stocks" element={<StocksPage />} />
        <Route path="/motivation" element={<MotivationPage />} />
        <Route path="/word-of-the-day" element={<WordOfDayPage />} />
        <Route path="/fun-fact" element={<FunFactPage />} />
        <Route path="/dad-joke" element={<DadJokePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
