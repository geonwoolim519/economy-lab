export const GOODS = {
  ramen: {
    id: 'ramen',
    name: '라면',
    subtitle: '매일 먹어도 괜찮은 음식',
    a: 80,
    b: 0.002,
    pMax: 18000,
    qMax: 90,
  },
  dessert: {
    id: 'dessert',
    name: '특별한 디저트',
    subtitle: '가격에 민감한 사치재',
    a: 120,
    b: 0.008,
    pMax: 18000,
    qMax: 90,
  },
}

export function quantityAt(good, price) {
  return Math.max(0, good.a - good.b * price)
}

export function totalRevenue(price, quantity) {
  return price * quantity
}

export function pointElasticity(good, price) {
  const q = quantityAt(good, price)
  if (q <= 0) return Infinity
  return (good.b * price) / q
}

export function classifyElasticity(ed) {
  if (!Number.isFinite(ed)) return 'elastic'
  if (Math.abs(ed - 1) < 0.08) return 'unit'
  if (ed > 1) return 'elastic'
  return 'inelastic'
}

export function elasticityLabel(kind) {
  if (kind === 'elastic') return '탄력적'
  if (kind === 'unit') return '단위탄력적'
  return '비탄력적'
}

export function percentChange(from, to) {
  if (from === 0) return 0
  return ((to - from) / from) * 100
}
