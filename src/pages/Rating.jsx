import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function Rating() {
  const { matchId } = useParams()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [looks, setLooks] = useState(5)
  const [character, setCharacter] = useState(5)
  const [submitted, setSubmitted] = useState(false)
  const [partner, setPartner] = useState(null)

  useEffect(() => {
    loadMatchPartner()
  }, [matchId])

  const loadMatchPartner = async () => {
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()
    if (match) {
      const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single()
      setPartner(p)
    }
  }

  const handleSubmit = async () => {
    if (!partner) return
    const avg = (looks + character) / 2
    await supabase.from('ratings').insert({
      match_id: matchId,
      rater_id: user.id,
      ratee_id: partner.id,
      looks_score: looks,
      character_score: character,
    })
    await supabase.from('token_transactions').insert({
      user_id: partner.id,
      amount: Math.floor(avg),
      type: 'earned',
      reference_id: matchId,
      description: 'Rating received',
    })
    await supabase.rpc('update_user_rating', { p_user_id: partner.id })
    await supabase.rpc('add_tokens', { p_user_id: partner.id, p_amount: Math.floor(avg) })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: '#fff', fontFamily: 'system-ui, sans-serif', gap: '1.5rem'
      }}>
        <div style={{ fontSize: '3rem' }}>✓</div>
        <h2 style={{ margin: 0 }}>Rating Submitted!</h2>
        <button onClick={() => navigate('/orbit')} style={{
          padding: '0.75rem 2rem', borderRadius: '2rem', border: 'none',
          background: 'linear-gradient(135deg, #e94057, #f27121)', color: '#fff',
          cursor: 'pointer', fontWeight: 600
        }}>Continue Matching</button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: '1.5rem',
        padding: '2rem', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '360px', width: '100%', textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>Rate Your Call</h2>
        {partner && <p style={{ color: 'rgba(255,255,255,0.6)' }}>How was {partner.display_name}?</p>}

        <div style={{ margin: '1.5rem 0' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
            Looks: {looks}
          </label>
          <input type="range" min="1" max="10" value={looks}
            onChange={(e) => setLooks(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#e94057' }}
          />
        </div>

        <div style={{ margin: '1.5rem 0' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
            Character: {character}
          </label>
          <input type="range" min="1" max="10" value={character}
            onChange={(e) => setCharacter(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#e94057' }}
          />
        </div>

        <div style={{ margin: '1rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
          Average: {(looks + character) / 2}
        </div>

        <button onClick={handleSubmit} style={{
          padding: '0.75rem 2rem', borderRadius: '2rem', border: 'none', width: '100%',
          background: 'linear-gradient(135deg, #e94057, #f27121)', color: '#fff',
          cursor: 'pointer', fontWeight: 600, fontSize: '1rem'
        }}>Submit Rating</button>
      </div>
    </div>
  )
}
