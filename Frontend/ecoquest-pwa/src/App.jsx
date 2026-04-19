import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home        from './pages/Home'
import Matchmaking from './pages/Matchmaking'
import MyQuests    from './pages/MyQuests'
import QuestDetail from './pages/QuestDetail'
import Camera      from './pages/Camera'
import RayBanTracker from './pages/RayBanTracker'
import Profile     from './pages/Profile'
import Onboarding  from './pages/Onboarding'

// Simple auth check — swap with real Cognito check later
const isAuthenticated = () => !!localStorage.getItem('ecoquest_token')

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/onboarding" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative w-full h-full grain">
        <Routes>
          {/* Public */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected — all main app screens */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/matchmaking" element={
            <ProtectedRoute>
              <Matchmaking />
            </ProtectedRoute>
          } />
          <Route path="/quests" element={
            <ProtectedRoute>
              <MyQuests />
            </ProtectedRoute>
          } />
          <Route path="/quests/:questId" element={
            <ProtectedRoute>
              <QuestDetail />
            </ProtectedRoute>
          } />
          <Route path="/camera" element={
            <ProtectedRoute>
              <Camera />
            </ProtectedRoute>
          } />
          <Route path="/tracker" element={
            <ProtectedRoute>
              <RayBanTracker />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Bottom nav shows on all protected screens */}
        {isAuthenticated() && <BottomNav />}
      </div>
    </BrowserRouter>
  )
}
