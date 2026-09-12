export function tradeFlow({ krPrice, usPrice, freight }) {
  const gap = usPrice - krPrice
  const exportGain = gap - freight
  const importGain = krPrice - usPrice - freight
  let direction = 'none'
  if (exportGain > 0.4) direction = 'export'
  else if (importGain > 0.4) direction = 'import'
  return {
    krPrice,
    usPrice,
    freight,
    exportGain,
    importGain,
    direction,
  }
}
