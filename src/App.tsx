import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import NavMapPage from '@/pages/NavMapPage'
import MissionControlPage from '@/pages/MissionControlPage'
import BodyPage from '@/pages/BodyPage'
import MindPage from '@/pages/MindPage'
import SpiritPage from '@/pages/SpiritPage'
import LifePage from '@/pages/LifePage'
import WorkPage from '@/pages/WorkPage'
import IntelligencePage from '@/pages/IntelligencePage'
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
 * v4 pillar-based rebuild: "/" is the tappable nav map (NavMapPage, now
 * 7 zones instead of 15). "/mission-control" is now the actual dashboard
 * (leaner than the old Briefing page — Weather/Horoscope/News moved to
 * Intelligence). "/briefing" redirects there for anyone with an old
 * bookmark/link. Six new pillar pages (Body/Mind/Spirit/Life/Work/
 * Intelligence) each aggregate existing feature components behind
 * collapsible Disclosure sections, filtered by pillar where relevant
 * (Tasks/Goals/Habits). Old single-topic pages (Calendar, Horoscope,
 * News, Sports, Stocks, Motivation, Word of the Day, Fun Fact, Dad Joke,
 * Progress) still work standalone — not linked from the map anymore, but
 * not removed either.
 */
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<NavMapPage />} />
        <Route path="/mission-control" element={<MissionControlPage />} />
        <Route path="/briefing" element={<Navigate to="/mission-control" replace />} />
        <Route path="/body" element={<BodyPage />} />
        <Route path="/mind" element={<MindPage />} />
        <Route path="/spirit" element={<SpiritPage />} />
        <Route path="/life" element={<LifePage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
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
