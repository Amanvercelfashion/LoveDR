import { motion } from 'framer-motion'

const OUTER_COUNT = 18
const MEDIUM_COUNT = 8

export default function OrbitCircles({ candidates, selected, searching }) {
  const medium = candidates.slice(0, MEDIUM_COUNT)
  const outer = candidates.slice(MEDIUM_COUNT, MEDIUM_COUNT + OUTER_COUNT)

  const mediumCircle = (candidate, index) => (
    <motion.div
      key={candidate.id}
      style={{
        position: 'absolute', width: '56px', height: '56px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem',
        fontWeight: 600, boxShadow: '0 0 20px rgba(102,126,234,0.3)',
        left: '50%', top: '50%', marginLeft: '-28px', marginTop: '-28px',
      }}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 20, repeat: Infinity, ease: 'linear',
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.7rem', textAlign: 'center',
        lineHeight: 1.2, overflow: 'hidden'
      }}>
        {candidate.display_name?.slice(0, 4) || '?'}
      </div>
    </motion.div>
  )

  const outerCircle = (candidate, index) => (
    <motion.div
      key={candidate.id}
      style={{
        position: 'absolute', width: '32px', height: '32px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #f093fb, #f5576c)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.625rem',
        fontWeight: 600, boxShadow: '0 0 12px rgba(245,87,108,0.3)',
        left: '50%', top: '50%', marginLeft: '-16px', marginTop: '-16px',
      }}
      animate={{
        rotate: -360,
      }}
      transition={{
        duration: 30, repeat: Infinity, ease: 'linear',
      }}
    >
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.6rem'
      }}>
        {candidate.avatar_id?.[0]?.toUpperCase() || '?'}
      </div>
    </motion.div>
  )

  return (
    <div style={{
      position: 'relative', width: '400px', height: '400px',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Center circle */}
      <motion.div
        animate={searching ? { scale: [1, 1.1, 1], rotate: 360 } : {}}
        transition={searching ? { duration: 0.8, repeat: Infinity } : {}}
        style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: selected
            ? 'linear-gradient(135deg, #e94057, #f27121)'
            : 'radial-gradient(circle, #302b63, #0f0c29)',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '0.75rem', textAlign: 'center',
          zIndex: 10, position: 'relative', boxShadow: '0 0 40px rgba(233,64,87,0.3)',
          flexDirection: 'column', gap: '0.25rem', lineHeight: 1.3
        }}
      >
        {selected ? (
          <div style={{ fontSize: '0.625rem', opacity: 0.9 }}>
            <div>{selected.display_name}</div>
            <div style={{ fontSize: '0.5rem', opacity: 0.7 }}>Rating: {selected.rating}</div>
          </div>
        ) : searching ? (
          <div style={{ fontSize: '0.5rem' }}>Searching...</div>
        ) : (
          <div style={{ fontSize: '0.5rem' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>?</div>
            <div>Slide to Match</div>
          </div>
        )}
      </motion.div>

      {/* Medium orbit - 8 circles */}
      {medium.map((c, i) => {
        const angle = (i / MEDIUM_COUNT) * 360
        const radius = 140
        return (
          <div key={c.id} style={{
            position: 'absolute', left: '50%', top: '50%', width: 0, height: 0,
          }}>
            <motion.div
              animate={searching ? { rotate: [0, 360] } : { rotate: 0 }}
              transition={searching ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
              style={{
                position: 'absolute', width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.7rem', fontWeight: 600,
                boxShadow: '0 0 20px rgba(102,126,234,0.3)',
                transform: `translate(${Math.cos(angle * Math.PI / 180) * radius - 28}px, ${Math.sin(angle * Math.PI / 180) * radius - 28}px)`,
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.65rem', overflow: 'hidden'
              }}>
                {c.display_name?.slice(0, 5) || '?'}
              </div>
            </motion.div>
          </div>
        )
      })}

      {/* Outer orbit - 18 circles */}
      {outer.map((c, i) => {
        const angle = (i / OUTER_COUNT) * 360
        const radius = 190
        return (
          <div key={c.id} style={{
            position: 'absolute', left: '50%', top: '50%', width: 0, height: 0,
          }}>
            <div style={{
              position: 'absolute', width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f093fb, #f5576c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.5rem', fontWeight: 600,
              boxShadow: '0 0 10px rgba(245,87,108,0.3)',
              transform: `translate(${Math.cos(angle * Math.PI / 180) * radius - 14}px, ${Math.sin(angle * Math.PI / 180) * radius - 14}px)`,
            }}>
              {c.avatar_id?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
