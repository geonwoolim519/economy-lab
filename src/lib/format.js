export function krw(n) {
  return `${Math.round(n).toLocaleString('ko-KR')}원`
}

export function signedKrw(n) {
  const rounded = Math.round(n)
  const abs = Math.abs(rounded).toLocaleString('ko-KR')
  if (rounded > 0) return `+${abs}원`
  if (rounded < 0) return `-${abs}원`
  return '0원'
}

export function qty(n, unit = '') {
  const value = Math.round(n).toLocaleString('ko-KR')
  return unit ? `${value}${unit}` : value
}

export function pct(n, digits = 1) {
  const value = Number(n).toFixed(digits)
  const num = Number(value)
  if (num > 0) return `+${value}%`
  return `${value}%`
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export function near(a, b, epsilon) {
  return Math.abs(a - b) <= epsilon
}
