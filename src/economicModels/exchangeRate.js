import { clamp } from '../lib/format.js'

export function exchangeRateScene(dollarHeat) {
  const h = clamp(dollarHeat, 0, 100)
  const fx = 1100 + h * 6.5
  const itemUsd = 100
  return {
    heat: h,
    fx,
    itemUsd,
    itemKrw: fx * itemUsd,
    importBurden: 40 + h * 0.5,
    tripCost: 30 + h * 0.55,
    exportBoost: 20 + h * 0.35,
  }
}
