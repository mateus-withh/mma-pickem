import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/ui/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { EventsPage } from '@/pages/EventsPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { RankingPage } from '@/pages/RankingPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetailPage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="historico" element={<HistoryPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="perfis/:profileId" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
