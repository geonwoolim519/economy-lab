export function computeGdp({ c, i, g, x, m }) {
  const netExport = x - m
  return {
    c,
    i,
    g,
    x,
    m,
    netExport,
    gdp: c + i + g + netExport,
  }
}
