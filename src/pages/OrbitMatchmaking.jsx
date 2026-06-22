import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import OrbitCircles from '../components/OrbitCircles'
import MatchSlot from '../components/MatchSlot'
import { useNavigate } from 'react-router-dom'

export default function OrbitMatchmaking() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [searching, setSearching] = useState(false)
  const [matchResult, setMatchResult] = useState(null)

  useEffect(() => {
    if (!user) return
    loadCandidates()
  }, [user])

  const loadCandidates = async () => {
    const { data } = await supabase.rpc('get_candidates', { p_user_id: user.id })
    setCandidates(data || [])
  }

  const handleSlideComplete = async () => {
    setSearching(true)
    setMatchResult(null)
    setSelectedMatch(null)
    const { data } = await supabase.rpc('get_candidates', { p_user_id: user.id })
    const pool = data || []
    if (pool.length === 0) {
      setSearching(false)
      return
    }
    const chosen = pool[0]
    const { data: matchData, error } = await supabase.rpc('create_match', {
      p_user1_id: user.id,
      p_user2_id: chosen.id,
    })
    if (error) {
      setSearching(false)
      return
    }
    setSelectedMatch(chosen)
    setMatchResult({ matchId: matchData, candidate: chosen })
    setSearching(false)
  }

  const handleSendRequest = async () => {
    if (!matchResult) return
    const { data } = await supabase
      .from('video_requests')
      .insert({
        match_id: matchResult.matchId,
        sender_id: user.id,
        receiver_id: matchResult.candidate.id,
        status: 'pending',
      })
      .select()
      .single()
    if (data) navigate(`/video-request/${data.id}`)
  }

  const handleSkip = () => {
    setMatchResult(null)
    setSelectedMatch(null)
    loadCandidates()
  }

  if (!profile) return null

  return (
    <div style={{
      minHeight: '100vh', background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0f0c29 100%)',
      overflow: 'hidden', position: 'relative', fontFamily: 'system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{
        position: 'absolute', top: '1rem', right: '1.5rem', color: 'rgba(255,255,255,0.8)',
        textAlign: 'right', fontSize: '0.875rem', zIndex: 10
      }}>
        <div>Rating: <strong>{profile.rating}</strong></div>
        <div>Tokens: <strong>{profile.tokens}</strong></div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {!matchResult ? (
          <OrbitCircles candidates={candidates} selected={selectedMatch} searching={searching} />
        ) : (
          <div style={{
            textAlign: 'center', color: '#fff', zIndex: 10,
            background: 'rgba(255,255,255,0.05)', borderRadius: '1.5rem',
            padding: '2rem', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '320px'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#302b63', margin: '0 auto 1rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
            }}>
              {matchResult.candidate.avatar_id?.[0]?.toUpperCase() || '?'}
            </div>
            <h2 style={{ margin: '0 0 0.25rem' }}>{matchResult.candidate.display_name}</h2>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
              Age: {matchResult.candidate.age} | Rating: {matchResult.candidate.rating}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0' }}>
              {matchResult.candidate.description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', margin: '1rem 0' }}>
              {(matchResult.candidate.interests || []).map((i) => (
                <span key={i} style={{
                  padding: '0.25rem 0.75rem', borderRadius: '1rem',
                  background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem'
                }}>{i}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button onClick={handleSkip} style={{
                padding: '0.625rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.3)',
                background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600
              }}>Skip</button>
              <button onClick={handleSendRequest} style={{
                padding: '0.625rem 1.5rem', borderRadius: '2rem', border: 'none',
                background: 'linear-gradient(135deg, #e94057, #f27121)', color: '#fff',
                cursor: 'pointer', fontWeight: 600
              }}>Send Video Request</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', marginBottom: '2rem' }}>
        <MatchSlot onSlideComplete={handleSlideComplete} disabled={!!matchResult || searching} />
      </div>
    </div>
  )
}
