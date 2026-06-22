import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import OrbitMatchmaking from './pages/OrbitMatchmaking'
import VideoRequest from './pages/VideoRequest'
import VideoCall from './pages/VideoCall'
import Rating from './pages/Rating'
import MatchHistory from './pages/MatchHistory'
import { supabase } from './lib/supabase'

function AuthGuard({ children }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  if (loading) return <div style={{ color: '#fff', background: '#0f0c29', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function UnauthGuard({ children }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  if (loading) return null
  if (user) return <Navigate to="/orbit" replace />
  return children
}

function AppRoutes() {
  const setUser = useAuthStore((s) => s.setUser)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id).then((profile) => {
            if (!profile) {
              supabase.from('profiles').insert({
                id: session.user.id,
                email: session.user.email,
                display_name: session.user.user_metadata?.full_name || 'User',
                avatar_id: 'default',
              }).then(() => {
                fetchProfile(session.user.id)
              }).catch(() => {})
            }
          }).catch(() => {})
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    let subscription
    try {
      const sub = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id).catch(() => {})
        } else {
          setUser(null)
        }
      })
      subscription = sub.data.subscription
    } catch {}

    return () => subscription?.unsubscribe()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<UnauthGuard><Login /></UnauthGuard>} />
      <Route path="/orbit" element={<AuthGuard><OrbitMatchmaking /></AuthGuard>} />
      <Route path="/video-request/:id" element={<AuthGuard><VideoRequest /></AuthGuard>} />
      <Route path="/video-call/:matchId" element={<AuthGuard><VideoCall /></AuthGuard>} />
      <Route path="/rating/:matchId" element={<AuthGuard><Rating /></AuthGuard>} />
      <Route path="/history" element={<AuthGuard><MatchHistory /></AuthGuard>} />
      <Route path="*" element={<Navigate to="/orbit" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
