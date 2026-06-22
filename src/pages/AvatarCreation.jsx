import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import AvatarPreview, { SKIN_TONES, HAIR_STYLES, CLOTHING_STYLES, HEIGHT_RANGES, WEIGHT_RANGES } from '../components/AvatarPreview'

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

const AGE_RANGES = []
for (let i = 18; i <= 80; i++) AGE_RANGES.push(i)

export default function AvatarCreation() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.user_metadata?.full_name || '')
  const [age, setAge] = useState(profile?.age || 25)
  const [gender, setGender] = useState(profile?.gender || '')
  const [description, setDescription] = useState(profile?.description || '')
  const [skinTone, setSkinTone] = useState(profile?.skin_tone || '#F1C27D')
  const [hairStyle, setHairStyle] = useState(profile?.hair_style || 'short')
  const [clothingStyle, setClothingStyle] = useState(profile?.clothing_style || 'casual')
  const [heightRange, setHeightRange] = useState(profile?.height_range || '5_5-5_9')
  const [weightRange, setWeightRange] = useState(profile?.weight_range || '60-70')

  const hairOptions = Object.entries(HAIR_STYLES)
  const clothingOptions = Object.entries(CLOTHING_STYLES)
  const heightOptions = Object.entries(HEIGHT_RANGES)
  const weightOptions = Object.entries(WEIGHT_RANGES)

  const steps = [
    { title: 'Basic Info', subtitle: 'Name, age & gender' },
    { title: 'About You', subtitle: 'A short bio' },
    { title: 'Skin Tone', subtitle: 'Choose your complexion' },
    { title: 'Hairstyle', subtitle: 'Pick your look' },
    { title: 'Style', subtitle: 'Your fashion vibe' },
    { title: 'Body Type', subtitle: 'Height & weight range' },
  ]

  async function handleSave() {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: displayName,
      age,
      gender,
      description,
      skin_tone: skinTone,
      hair_style: hairStyle,
      clothing_style: clothingStyle,
      height_range: heightRange,
      weight_range: weightRange,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    })
    if (!error) {
      await fetchProfile(user.id)
      navigate('/orbit', { replace: true })
    }
    setSaving(false)
  }

  const canProceed = () => {
    if (step === 0) return displayName.trim() && age >= 18 && gender
    return true
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 500, marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: '0.5rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? 'linear-gradient(90deg, #e94057, #f27121)' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem' }}>{steps[step].title}</h2>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{steps[step].subtitle}</p>
      </div>

      <div style={{
        width: '100%', maxWidth: 500,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '1.5rem',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Display Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Age</label>
              <select value={age} onChange={(e) => setAge(Number(e.target.value))} style={inputStyle}>
                {AGE_RANGES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Gender</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGender(g.value)}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: 12, cursor: 'pointer',
                      border: gender === g.value ? '2px solid #e94057' : '2px solid rgba(255,255,255,0.1)',
                      background: gender === g.value ? 'rgba(233,64,87,0.15)' : 'rgba(255,255,255,0.05)',
                      color: '#fff', fontSize: '0.95rem', fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>About You</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people a bit about yourself..."
              rows={5}
              style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
              {description.length}/300 characters
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <AvatarPreview
                skinTone={skinTone}
                hairStyle={hairStyle}
                clothingStyle={clothingStyle}
                heightRange={heightRange}
                weightRange={weightRange}
                size={140}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => setSkinTone(tone.value)}
                  style={{
                    width: 52, height: 52, borderRadius: '50%', cursor: 'pointer',
                    background: tone.value,
                    border: skinTone === tone.value ? '3px solid #fff' : '3px solid rgba(255,255,255,0.15)',
                    boxShadow: skinTone === tone.value ? '0 0 12px rgba(233,64,87,0.5)' : 'none',
                    transition: 'all 0.2s',
                  }}
                  title={tone.label}
                />
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: 12, color: 'rgba(255,255,255,0.6)' }}>
              {SKIN_TONES.find((t) => t.value === skinTone)?.label || 'Custom'}
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <AvatarPreview
                skinTone={skinTone}
                hairStyle={hairStyle}
                clothingStyle={clothingStyle}
                heightRange={heightRange}
                weightRange={weightRange}
                size={140}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {hairOptions.map(([key, hair]) => (
                <button
                  key={key}
                  onClick={() => setHairStyle(key)}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: 20, cursor: 'pointer',
                    border: hairStyle === key ? '2px solid #e94057' : '1px solid rgba(255,255,255,0.15)',
                    background: hairStyle === key ? 'rgba(233,64,87,0.15)' : 'rgba(255,255,255,0.05)',
                    color: '#fff', fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {hair.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <AvatarPreview
                skinTone={skinTone}
                hairStyle={hairStyle}
                clothingStyle={clothingStyle}
                heightRange={heightRange}
                weightRange={weightRange}
                size={140}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {clothingOptions.map(([key, cloth]) => (
                <button
                  key={key}
                  onClick={() => setClothingStyle(key)}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: 20, cursor: 'pointer',
                    border: clothingStyle === key ? '2px solid #e94057' : '1px solid rgba(255,255,255,0.15)',
                    background: clothingStyle === key ? 'rgba(233,64,87,0.15)' : 'rgba(255,255,255,0.05)',
                    color: '#fff', fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {cloth.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <AvatarPreview
                skinTone={skinTone}
                hairStyle={hairStyle}
                clothingStyle={clothingStyle}
                heightRange={heightRange}
                weightRange={weightRange}
                size={160}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Height</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {heightOptions.map(([key, h]) => (
                  <button
                    key={key}
                    onClick={() => setHeightRange(key)}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: 16, cursor: 'pointer',
                      border: heightRange === key ? '2px solid #e94057' : '1px solid rgba(255,255,255,0.15)',
                      background: heightRange === key ? 'rgba(233,64,87,0.15)' : 'rgba(255,255,255,0.05)',
                      color: '#fff', fontSize: '0.82rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Weight Range</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {weightOptions.map(([key, w]) => (
                  <button
                    key={key}
                    onClick={() => setWeightRange(key)}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: 16, cursor: 'pointer',
                      border: weightRange === key ? '2px solid #e94057' : '1px solid rgba(255,255,255,0.15)',
                      background: weightRange === key ? 'rgba(233,64,87,0.15)' : 'rgba(255,255,255,0.05)',
                      color: '#fff', fontSize: '0.82rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: 500, marginTop: '1.5rem', display: 'flex', gap: 12 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{
            flex: 1, padding: '0.9rem', borderRadius: 14, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: '#fff', fontSize: '1rem', fontWeight: 600,
          }}>
            Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            onClick={() => canProceed() && setStep(step + 1)}
            disabled={!canProceed()}
            style={{
              flex: 1, padding: '0.9rem', borderRadius: 14, cursor: canProceed() ? 'pointer' : 'not-allowed',
              border: 'none',
              background: canProceed() ? 'linear-gradient(135deg, #e94057, #f27121)' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontSize: '1rem', fontWeight: 600, opacity: canProceed() ? 1 : 0.5,
            }}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: '0.9rem', borderRadius: 14, cursor: saving ? 'not-allowed' : 'pointer',
              border: 'none',
              background: saving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #e94057, #f27121)',
              color: '#fff', fontSize: '1rem', fontWeight: 600,
            }}
          >
            {saving ? 'Saving...' : 'Complete Profile'}
          </button>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff', fontSize: '0.95rem', outline: 'none',
  boxSizing: 'border-box',
}
