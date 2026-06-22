import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import AvatarCreation from './pages/AvatarCreation'
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
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)
  if (loading) return null
  if (user) return <Navigate to={profile?.onboarding_complete ? '/orbit' : '/create-avatar'} replace />
  return children
}

function OnboardingGuard({ children }) {
  const profile = useAuthStore((s) => s.profile)
  const loading = useAuthStore((s) => s.loading)
  if (loading || !profile) return <div style={{ color: '#fff', background: '#0f0c29', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  if (!profile.onboarding_complete) return <Navigate to="/create-avatar" replace />
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
                onboarding_complete: false,
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
      <Route path="/create-avatar" element={<AuthGuard><AvatarCreation /></AuthGuard>} />
      <Route path="/orbit" element={<AuthGuard><OnboardingGuard><OrbitMatchmaking /></OnboardingGuard></AuthGuard>} />
      <Route path="/video-request/:id" element={<AuthGuard><OnboardingGuard><VideoRequest /></OnboardingGuard></AuthGuard>} />
      <Route path="/video-call/:matchId" element={<AuthGuard><OnboardingGuard><VideoCall /></OnboardingGuard></AuthGuard>} />
      <Route path="/rating/:matchId" element={<AuthGuard><OnboardingGuard><Rating /></OnboardingGuard></AuthGuard>} />
      <Route path="/history" element={<AuthGuard><OnboardingGuard><MatchHistory /></OnboardingGuard></AuthGuard>} />
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
