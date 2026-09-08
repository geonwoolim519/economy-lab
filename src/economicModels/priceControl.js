import { equilibrium, gap } from './supplyDemand.js'

export function ceilingOutcome(market, ceiling) {
  const eq = equilibrium(market)
  if (ceiling >= eq.price - 1) {
    return {
      binding: false,
      price: eq.price,
      quantity: eq.quantity,
      qd: eq.quantity,
      qs: eq.quantity,
      shortage: 0,
      surplus: 0,
      traded: eq.quantity,
    }
  }

  const { qd, qs, excessDemand } = gap(market, ceiling)
  return {
    binding: true,
    price: ceiling,
    quantity: qs,
    qd,
    qs,
    shortage: Math.max(0, excessDemand),
    surplus: 0,
    traded: qs,
  }
}

export function floorOutcome(market, floor) {
  const eq = equilibrium(market)
  if (floor <= eq.price + 1) {
    return {
      binding: false,
      price: eq.price,
      quantity: eq.quantity,
      qd: eq.quantity,
      qs: eq.quantity,
      shortage: 0,
      surplus: 0,
      traded: eq.quantity,
    }
  }

  const { qd, qs, excessSupply } = gap(market, floor)
  return {
    binding: true,
    price: floor,
    quantity: qd,
    qd,
    qs,
    shortage: 0,
    surplus: Math.max(0, excessSupply),
    traded: qd,
  }
}
