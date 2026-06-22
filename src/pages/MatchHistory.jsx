import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function MatchHistory() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*, user1:user1_id(*), user2:user2_id(*)')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    setMatches(data || [])
  }

  const handleReconnect = async (matchId, partnerId) => {
    const { data } = await supabase.rpc('create_match', {
      p_user1_id: user.id,
      p_user2_id: partnerId,
    })
    if (data) {
      const { data: vr } = await supabase
        .from('video_requests')
        .insert({ match_id: data, sender_id: user.id, receiver_id: partnerId, status: 'pending' })
        .select()
        .single()
      if (vr) navigate(`/video-request/${vr.id}`)
    }
  }

  const getPartner = (match) => {
    return match.user1_id === user.id ? match.user2 : match.user1
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Match History</h1>
        <button onClick={() => navigate('/orbit')} style={{
          padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.3)',
          background: 'transparent', color: '#fff', cursor: 'pointer'
        }}>Back to Orbit</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        {matches.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No matches yet.</p>
        )}
        {matches.map((match) => {
          const partner = getPartner(match)
          return (
            <div key={match.id} style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: '1rem',
              padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: '#302b63', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.25rem'
                }}>
                  {partner?.display_name?.[0] || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{partner?.display_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    {match.status} - {new Date(match.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button onClick={() => handleReconnect(match.id, partner.id)} style={{
                padding: '0.5rem 1rem', borderRadius: '2rem', border: 'none',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
              }}>Reconnect</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
