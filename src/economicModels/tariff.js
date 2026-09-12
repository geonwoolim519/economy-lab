export function tariffScene(ratePercent, worldPrice = 10000) {
  const rate = Math.max(0, ratePercent)
  const domesticPrice = worldPrice * (1 + rate / 100)
  const importQty = Math.max(8, 82 - rate * 1.6)
  const producer = Math.min(92, 28 + rate * 1.1)
  const consumerBurden = Math.min(92, 18 + rate * 1.4)
  const revenue = ((worldPrice * rate) / 100) * (importQty / 20)
  return {
    rate,
    worldPrice,
    domesticPrice,
    importQty,
    producer,
    consumerBurden,
    revenue,
  }
}
