import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function VideoCall() {
  const { matchId } = useParams()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const pcRef = useRef(null)
  const [match, setMatch] = useState(null)
  const [partner, setPartner] = useState(null)
  const [timeLeft, setTimeLeft] = useState(900)
  const [connected, setConnected] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const channelRef = useRef(null)

  useEffect(() => {
    loadMatch()
    return () => {
      pcRef.current?.close()
      channelRef.current?.unsubscribe()
    }
  }, [matchId])

  const loadMatch = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()
    if (data) {
      setMatch(data)
      const partnerId = data.user1_id === user.id ? data.user2_id : data.user1_id
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single()
      setPartner(p)
    }
  }

  useEffect(() => {
    if (!match) return
    const startTime = new Date(match.created_at).getTime()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, 900 - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        supabase.from('matches').update({ status: 'expired' }).eq('id', matchId)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [match])

  useEffect(() => {
    if (!match || timeLeft <= 0 || connected) return
    const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id
    const roomId = matchId

    const channel = supabase.channel(`rtc_${roomId}`, {
      config: { broadcast: { self: true } },
    })

    channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
      handleSignal(payload)
    })

    channel.subscribe(async (status) => {
      if (status === 'subscribed') {
        await startCall(channel, partnerId)
      }
    })

    channelRef.current = channel
  }, [match, connected])

  const startCall = async (channel, partnerId) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    if (localVideoRef.current) localVideoRef.current.srcObject = stream

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    pcRef.current = pc

    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0]
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({ type: 'broadcast', event: 'signal', payload: { candidate: event.candidate } })
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setConnected(true)
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    channel.send({ type: 'broadcast', event: 'signal', payload: { offer } })
  }

  const handleSignal = async (data) => {
    const pc = pcRef.current
    if (!pc) return

    if (data.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      channelRef.current?.send({ type: 'broadcast', event: 'signal', payload: { answer } })
    } else if (data.answer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
    } else if (data.candidate) {
      try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)) } catch {}
    }
  }

  const endCall = () => {
    pcRef.current?.close()
    setCallEnded(true)
    navigate(`/rating/${matchId}`)
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  if (callEnded) return null

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a1a', display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif', color: '#fff'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.5)'
      }}>
        <div>
          {partner && <span>Calling: {partner.display_name}</span>}
        </div>
        <div style={{
          color: timeLeft < 60 ? '#e94057' : 'rgba(255,255,255,0.7)',
          fontSize: '1.25rem', fontWeight: 600
        }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', position: 'relative', background: '#111' }}>
        <video ref={remoteVideoRef} autoPlay playsInline style={{
          flex: 1, objectFit: 'cover', background: '#111'
        }} />
        <video ref={localVideoRef} autoPlay playsInline muted style={{
          position: 'absolute', bottom: '1.5rem', right: '1.5rem', width: '160px',
          height: '120px', objectFit: 'cover', borderRadius: '0.75rem',
          border: '2px solid rgba(255,255,255,0.2)', background: '#222'
        }} />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: '1.5rem',
        padding: '1.5rem', background: 'rgba(0,0,0,0.5)'
      }}>
        {connected && (
          <button onClick={endCall} style={{
            padding: '0.75rem 2rem', borderRadius: '2rem', border: 'none',
            background: '#e94057', color: '#fff', cursor: 'pointer', fontWeight: 600
          }}>End Call</button>
        )}
      </div>
    </div>
  )
}
