import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import MissionControlPage from '@/pages/MissionControlPage'
import BriefingPage from '@/pages/BriefingPage'
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
 */
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<MissionControlPage />} />
        <Route path="/mission-control" element={<MissionControlPage />} />
        <Route path="/briefing" element={<BriefingPage />} />
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
