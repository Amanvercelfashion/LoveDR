import { useState, useRef } from 'react'

export default function MatchSlot({ onSlideComplete, disabled }) {
  const [sliding, setSliding] = useState(false)
  const [complete, setComplete] = useState(false)
  const trackRef = useRef(null)

  const handlePointerDown = () => {
    if (disabled || complete) return
    setSliding(true)
  }

  const handlePointerUp = (e) => {
    if (!sliding) return
    setSliding(false)
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0
    const pct = (x - rect.left) / rect.width
    if (pct > 0.85) {
      setComplete(true)
      onSlideComplete()
      setTimeout(() => setComplete(false), 1500)
    } else {
      setComplete(false)
    }
  }

  return (
    <div
      ref={trackRef}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseLeave={() => setSliding(false)}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      style={{
        width: '100%', height: '56px', borderRadius: '28px',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
        overflow: 'hidden', userSelect: 'none', touchAction: 'none',
        opacity: disabled ? 0.5 : 1
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'rgba(255,255,255,0.4)',
        fontSize: '0.875rem', letterSpacing: '0.1em', fontWeight: 500,
        zIndex: 1
      }}>
        {complete ? '✓ Matched!' : 'Slide to Match'}
      </div>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #e94057, #f27121)',
        position: 'absolute', top: '3px', left: sliding ? undefined : '3px',
        right: sliding ? '3px' : undefined,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '1.25rem', transition: 'left 0.1s, right 0.1s',
        boxShadow: '0 2px 8px rgba(233,64,87,0.4)', zIndex: 2
      }}>
        {complete ? '✓' : '►'}
      </div>
    </div>
  )
}
