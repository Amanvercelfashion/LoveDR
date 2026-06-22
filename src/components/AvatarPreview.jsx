const SKIN_TONES = [
  { value: '#FFE0BD', label: 'Light' },
  { value: '#F1C27D', label: 'Warm' },
  { value: '#D4A574', label: 'Tan' },
  { value: '#A0724A', label: 'Brown' },
  { value: '#6B4226', label: 'Dark' },
]

const HAIR_STYLES = {
  short: { label: 'Short', path: 'M160 115 Q160 70 200 65 Q240 60 260 70 Q280 80 280 115 Z' },
  medium: { label: 'Medium', path: 'M155 120 Q150 60 200 50 Q250 40 285 65 Q295 80 290 120 Z' },
  long: { label: 'Long', path: 'M155 120 Q140 50 200 40 Q260 30 290 60 Q300 80 295 120 L290 180 Q280 190 270 180 L275 120 Q270 80 220 75 Q170 70 160 110 L155 180 Q145 190 140 180 Z' },
  curly: { label: 'Curly', path: 'M150 125 Q140 80 170 55 Q190 40 220 45 Q250 40 270 55 Q300 75 295 120 Q300 90 280 70 Q260 55 220 55 Q180 55 160 70 Q145 85 150 125 Z' },
  afro: { label: 'Afro', path: 'M140 130 Q130 70 170 45 Q200 30 240 35 Q280 40 300 75 Q310 110 300 135 Q310 90 290 60 Q260 35 220 30 Q180 30 155 50 Q135 75 140 130 Z' },
  ponytail: { label: 'Ponytail', path: 'M155 120 Q150 55 200 45 Q250 35 285 60 Q295 80 290 120 L285 130 L275 125 Q270 80 220 70 Q170 65 160 100 L155 180 Q150 195 145 185 Z' },
  bun: { label: 'Bun', path: 'M155 120 Q150 55 200 45 Q250 35 285 60 Q295 80 290 120 Q295 100 285 75 Q260 50 220 48 Q180 48 160 65 Q148 85 155 120 Z M200 30 Q210 10 230 12 Q245 15 240 30 Q230 28 220 25 Q210 25 200 30 Z' },
  bald: { label: 'Bald', path: '' },
}

const CLOTHING_STYLES = {
  casual: { label: 'Casual', fill: '#4A90D9', neck: '#3A7BC8', collar: false },
  formal: { label: 'Formal', fill: '#2C3E50', neck: '#1A252F', collar: true },
  sporty: { label: 'Sporty', fill: '#E74C3C', neck: '#C0392B', collar: false },
  elegant: { label: 'Elegant', fill: '#8E44AD', neck: '#732D91', collar: true },
  bohemian: { label: 'Bohemian', fill: '#E67E22', neck: '#D35400', collar: false },
}

const HEIGHT_RANGES = {
  under_5_0: { label: 'Under 5\'0"', scale: 0.85 },
  '5_0-5_4': { label: '5\'0" - 5\'4"', scale: 0.92 },
  '5_5-5_9': { label: '5\'5" - 5\'9"', scale: 1.0 },
  '5_10-6_1': { label: '5\'10" - 6\'1"', scale: 1.08 },
  '6_2+': { label: '6\'2"+', scale: 1.15 },
}

const WEIGHT_RANGES = {
  under_50: { label: 'Under 50kg', width: 0.85 },
  '50-60': { label: '50-60kg', width: 0.93 },
  '60-70': { label: '60-70kg', width: 1.0 },
  '70-85': { label: '70-85kg', width: 1.08 },
  '85+': { label: '85kg+', width: 1.15 },
}

function Hair({ style, skinTone }) {
  const hairDef = HAIR_STYLES[style] || HAIR_STYLES.short
  const hairColors = ['#1a1a1a', '#3a2a1a', '#5a3a1a', '#8a6a3a', '#c4a44a', '#e8c878']
  const color = style === 'bald' ? 'transparent' : hairColors[Math.floor(Math.random() * hairColors.length)]
  if (style === 'bald' || !hairDef.path) return null
  return <path d={hairDef.path} fill={color} />
}

function Clothing({ style, heightScale, weightWidth }) {
  const cloth = CLOTHING_STYLES[style] || CLOTHING_STYLES.casual
  const w = 120 * weightWidth
  const h = 130 * heightScale
  const neckW = 30 * weightWidth

  return (
    <g>
      <path
        d={`M${220 - w / 2} 230 L${220 + w / 2} 230 L${220 + w / 2 + 10} ${230 + h} L${220 - w / 2 - 10} ${230 + h} Z`}
        fill={cloth.fill}
        stroke={cloth.neck}
        strokeWidth="2"
      />
      {cloth.collar && (
        <path
          d={`M${220 - neckW / 2 - 8} 230 L${220 - neckW / 2} 215 L${220} 225 L${220 + neckW / 2} 215 L${220 + neckW / 2 + 8} 230 Z`}
          fill={cloth.neck}
        />
      )}
      {!cloth.collar && (
        <path
          d={`M${220 - neckW / 2} 230 Q${220 - neckW / 4} 240 ${220} 235 Q${220 + neckW / 4} 240 ${220 + neckW / 2} 230`}
          fill={cloth.neck}
        />
      )}
    </g>
  )
}

export default function AvatarPreview({ skinTone = '#F1C27D', hairStyle = 'short', clothingStyle = 'casual', heightRange = '5_5-5_9', weightRange = '60-70', size = 180 }) {
  const height = HEIGHT_RANGES[heightRange] || HEIGHT_RANGES['5_5-5_9']
  const weight = WEIGHT_RANGES[weightRange] || WEIGHT_RANGES['60-70']

  return (
    <svg width={size} height={size} viewBox="0 0 440 480" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Hair style={hairStyle} skinTone={skinTone} />
      <ellipse cx="220" cy="155" rx="65" ry="55" fill={skinTone} />
      <circle cx="198" cy="145" r="5" fill="#333" />
      <circle cx="242" cy="145" r="5" fill="#333" />
      <ellipse cx="220" cy="170" rx="20" ry="10" fill="#e88" opacity="0.3" />
      <path d="M210 175 Q220 182 230 175" stroke="#c66" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Clothing style={clothingStyle} heightScale={height.scale} weightWidth={weight.width} />
      <line x1="190" y1="250" x2="175" y2="350" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
      <line x1="250" y1="250" x2="265" y2="350" stroke={skinTone} strokeWidth="12" strokeLinecap="round" />
    </svg>
  )
}

export { SKIN_TONES, HAIR_STYLES, CLOTHING_STYLES, HEIGHT_RANGES, WEIGHT_RANGES }
