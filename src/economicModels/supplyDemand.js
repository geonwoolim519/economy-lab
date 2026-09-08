export const CHICKEN = {
  demandA: 140,
  demandB: 0.006,
  supplyA: -20,
  supplyB: 0.006,
  pMax: 26000,
  qMax: 160,
}

export function quantityDemanded(market, price) {
  return Math.max(0, market.demandA - market.demandB * price)
}

export function quantitySupplied(market, price) {
  return Math.max(0, market.supplyA + market.supplyB * price)
}

export function equilibrium(market) {
  const denom = market.demandB + market.supplyB
  const price = (market.demandA - market.supplyA) / denom
  return {
    price,
    quantity: quantityDemanded(market, price),
  }
}

export function gap(market, price) {
  const qd = quantityDemanded(market, price)
  const qs = quantitySupplied(market, price)
  return {
    qd,
    qs,
    excessDemand: qd - qs,
    excessSupply: qs - qd,
  }
}

export function withShifts(base, { income = 0, cost = 0, tax = 0, subsidy = 0 } = {}) {
  const taxNet = tax - subsidy
  return {
    ...base,
    demandA: base.demandA + income,
    supplyA: base.supplyA - cost - base.supplyB * taxNet,
  }
}

export function incomeShiftFromManwon(manwon) {
  return (manwon - 200) / 10
}

export function costShiftFromWon(costWon) {
  return (costWon - 4000) / 150
}

export function trendFromDelta(delta, epsilon = 0.4) {
  if (delta > epsilon) return 'up'
  if (delta < -epsilon) return 'down'
  return 'same'
}
