import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import NavMapPage from '@/pages/NavMapPage'
import BriefingPage from '@/pages/BriefingPage'
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
 * "/" and "/mission-control" are the tappable nav map (NavMapPage) — the
 * dashboard content that used to live there moved to "/briefing", now the
 * full Daily Briefing dashboard.
 */
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<NavMapPage />} />
        <Route path="/mission-control" element={<NavMapPage />} />
        <Route path="/briefing" element={<BriefingPage />} />
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
