import { clamp } from '../lib/format.js'

export function moneyScene(supply) {
  const s = clamp(supply, 80, 140)
  const extra = s - 100
  return {
    supply: s,
    spending: Math.round(48 + (s - 80) * 0.65),
    activity: Math.round(50 + (s - 80) * 0.55),
    prices: Math.round(36 + Math.max(0, extra) * 0.85),
    rate: Math.round(clamp(58 - (s - 80) * 0.42, 12, 80)),
    pressure: extra,
  }
}
