import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function VideoRequest() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [sender, setSender] = useState(null)
  const [responseSent, setResponseSent] = useState(false)

  useEffect(() => {
    loadRequest()
  }, [id])

  const loadRequest = async () => {
    const { data } = await supabase
      .from('video_requests')
      .select('*, match:match_id(*)')
      .eq('id', id)
      .single()
    if (data) {
      setRequest(data)
      const { data: senderData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.sender_id)
        .single()
      setSender(senderData)
    }
  }

  const handleRespond = async (status) => {
    await supabase
      .from('video_requests')
      .update({ status })
      .eq('id', id)

    if (status === 'accepted') {
      await supabase
        .from('matches')
        .update({ status: 'active' })
        .eq('id', request.match_id)
      navigate(`/video-call/${request.match_id}`)
    } else {
      setResponseSent(true)
    }
  }

  const isReceiver = request?.receiver_id === user?.id

  if (!request || !sender) return null

  if (responseSent) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: '#fff', fontFamily: 'system-ui, sans-serif'
      }}>
        <p>Request declined.</p>
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
        textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '1.5rem',
        padding: '2rem', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '360px', width: '100%'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: '#302b63', margin: '0 auto 1rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
        }}>
          {sender.display_name?.[0] || '?'}
        </div>
        <h2 style={{ margin: '0 0 0.25rem' }}>
          {sender.display_name} wants to connect with you.
        </h2>
        <div style={{ color: 'rgba(255,255,255,0.6)', margin: '0.5rem 0' }}>
          Age: {sender.age} | Rating: {sender.rating}
        </div>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
          {sender.description}
        </p>
        {isReceiver && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button onClick={() => handleRespond('declined')} style={{
              padding: '0.75rem 2rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.3)',
              background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600
            }}>Decline</button>
            <button onClick={() => handleRespond('accepted')} style={{
              padding: '0.75rem 2rem', borderRadius: '2rem', border: 'none',
              background: 'linear-gradient(135deg, #e94057, #f27121)', color: '#fff',
              cursor: 'pointer', fontWeight: 600
            }}>Accept</button>
          </div>
        )}
        {!isReceiver && (
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}>
            Waiting for response...
          </p>
        )}
      </div>
    </div>
  )
}
