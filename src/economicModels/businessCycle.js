export const CYCLE_PHASES = [
  {
    id: 'recovery',
    label: '회복',
    production: 58,
    consumption: 55,
    investment: 52,
    employment: 54,
  },
  {
    id: 'boom',
    label: '호황',
    production: 88,
    consumption: 86,
    investment: 84,
    employment: 82,
  },
  {
    id: 'slowdown',
    label: '둔화',
    production: 64,
    consumption: 60,
    investment: 48,
    employment: 58,
  },
  {
    id: 'recession',
    label: '침체',
    production: 32,
    consumption: 34,
    investment: 28,
    employment: 36,
  },
]

export function cycleScene(phase) {
  const index = Math.min(3, Math.max(0, Math.round(phase)))
  return { index, ...CYCLE_PHASES[index] }
}

export function cycleWavePoints(width, height) {
  const pad = 18
  const innerW = width - pad * 2
  const mid = height / 2
  const amp = height * 0.32
  const points = []
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40
    const x = pad + t * innerW
    const y = mid - Math.sin(t * Math.PI * 2) * amp
    points.push(`${x},${y}`)
  }
  return { points: points.join(' '), pad, innerW, mid, amp }
}
