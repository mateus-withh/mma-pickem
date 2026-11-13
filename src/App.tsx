import { AppRoutes } from '@/routes/AppRoutes'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'


function App() {
  useRealtimeSync()
  return <AppRoutes />
}

export default App
