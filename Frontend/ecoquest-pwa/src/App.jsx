import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav     from './components/BottomNav'
import Home          from './pages/Home'
import Matchmaking   from './pages/Matchmaking'
import MyQuests      from './pages/MyQuests'
import QuestDetail   from './pages/QuestDetail'
import Camera        from './pages/Camera'
import RayBanTracker from './pages/RayBanTracker'
import Profile       from './pages/Profile'
import Onboarding    from './pages/Onboarding'

const isLoggedIn = () => !!localStorage.getItem('ecoquest_token')

function ProtectedRoute({ children, onLogin }) {
  if (!isLoggedIn()) return <Navigate to="/onboarding" replace />
  return children
}

function PublicRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/" replace /> : children
}

export default function App() {
  // loggedIn as state so BottomNav re-renders when token is set
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())

  // Pass this down to Onboarding so it can trigger a re-render
  const handleAuthChange = () => setLoggedIn(isLoggedIn())

  return (
    <BrowserRouter>
      <div className="relative w-full h-full grain">
        <Routes>

          <Route path="/onboarding" element={
            <PublicRoute>
              <Onboarding onAuthChange={handleAuthChange} />
            </PublicRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/matchmaking" element={
            <ProtectedRoute><Matchmaking /></ProtectedRoute>
          } />
          <Route path="/quests" element={
            <ProtectedRoute><MyQuests /></ProtectedRoute>
          } />
          <Route path="/quests/:questId" element={
            <ProtectedRoute><QuestDetail /></ProtectedRoute>
          } />
          <Route path="/camera" element={
            <ProtectedRoute><Camera /></ProtectedRoute>
          } />
          <Route path="/tracker" element={
            <ProtectedRoute><RayBanTracker /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

        {/* Now uses state instead of a direct localStorage check */}
        {loggedIn && <BottomNav />}
      </div>
    </BrowserRouter>
  )
}