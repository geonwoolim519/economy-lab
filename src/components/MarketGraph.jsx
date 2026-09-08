import { equilibrium, gap } from '../economicModels/supplyDemand.js'
import { krw } from '../lib/format.js'
import { useLerp } from '../hooks/useLerp.js'

const WIDTH = 340
const HEIGHT = 250
const PAD = { left: 54, right: 16, top: 18, bottom: 36 }

function xOf(q, qMax) {
  return PAD.left + (q / qMax) * (WIDTH - PAD.left - PAD.right)
}

function yOf(p, pMax) {
  return PAD.top + (1 - p / pMax) * (HEIGHT - PAD.top - PAD.bottom)
}

function uniqueSorted(points) {
  const map = new Map()
  points.forEach((pt) => {
    const key = `${Math.round(pt.q)}-${Math.round(pt.p)}`
    map.set(key, pt)
  })
  return [...map.values()].sort((a, b) => a.q - b.q)
}

function inView(q, p, qMax, pMax) {
  return q >= -1 && q <= qMax + 1 && p >= -1 && p <= pMax + 1
}

function demandPoints(market, qMax, pMax) {
  const { demandA: a, demandB: b } = market
  const candidates = [
    { q: 0, p: a / b },
    { q: a, p: 0 },
    { q: qMax, p: (a - qMax) / b },
    { q: a - b * pMax, p: pMax },
  ].filter((pt) => inView(pt.q, pt.p, qMax, pMax))
  return uniqueSorted(candidates)
}

function supplyPoints(market, qMax, pMax) {
  const { supplyA: a, supplyB: b } = market
  const candidates = [
    { q: 0, p: -a / b },
    { q: a, p: 0 },
    { q: qMax, p: (qMax - a) / b },
    { q: a + b * pMax, p: pMax },
  ].filter((pt) => inView(pt.q, pt.p, qMax, pMax) && pt.p >= 0)
  return uniqueSorted(candidates)
}

function toPath(points, qMax, pMax) {
  if (points.length < 2) return ''
  return points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xOf(pt.q, qMax)} ${yOf(pt.p, pMax)}`)
    .join(' ')
}

export default function MarketGraph({
  market,
  ghostMarket,
  price,
  showDemand = true,
  showSupply = true,
  showEq = true,
  showPriceLine = true,
  ceiling = null,
  floor = null,
  onlyDemand = false,
  qMax = 160,
  pMax = 26000,
}) {
  const demandA = useLerp(market.demandA)
  const supplyA = useLerp(market.supplyA)
  const shownPrice = useLerp(price ?? 0)
  const live = { ...market, demandA, supplyA }

  const demandPath = toPath(demandPoints(live, qMax, pMax), qMax, pMax)
  const supplyPath = toPath(supplyPoints(live, qMax, pMax), qMax, pMax)
  const ghostDemand = ghostMarket ? toPath(demandPoints(ghostMarket, qMax, pMax), qMax, pMax) : ''
  const ghostSupply = ghostMarket ? toPath(supplyPoints(ghostMarket, qMax, pMax), qMax, pMax) : ''
  const eq = showEq ? equilibrium(live) : null
  const snapshot = price != null ? gap(live, shownPrice) : null

  const ticksP = pMax >= 20000 ? [0, 8000, 16000, 24000] : [0, 5000, 10000, 15000]
  const ticksQ = qMax >= 140 ? [0, 40, 80, 120] : [0, 20, 40, 60, 80]

  const shortage = snapshot && snapshot.excessDemand > 1.2
  const surplus = snapshot && snapshot.excessSupply > 1.2

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="수요와 공급 그래프" style={{ width: '100%' }}>
      {ticksP.map((p) => (
        <g key={`p-${p}`}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={yOf(p, pMax)}
            y2={yOf(p, pMax)}
            stroke="#eef1f6"
            strokeWidth="1"
          />
          <text x={PAD.left - 6} y={yOf(p, pMax) + 4} textAnchor="end" fontSize="10" fill="#667085">
            {p === 0 ? '0' : Math.round(p).toLocaleString('ko-KR')}
          </text>
        </g>
      ))}
      {ticksQ.map((q) => (
        <text key={`q-${q}`} x={xOf(q, qMax)} y={HEIGHT - 10} textAnchor="middle" fontSize="10" fill="#667085">
          {Math.round(q)}
        </text>
      ))}

      {ceiling != null && (
        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={yOf(ceiling, pMax)}
          y2={yOf(ceiling, pMax)}
          stroke="#3157d5"
          strokeDasharray="5 5"
          strokeWidth="1.8"
        />
      )}
      {floor != null && (
        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={yOf(floor, pMax)}
          y2={yOf(floor, pMax)}
          stroke="#e8853a"
          strokeDasharray="5 5"
          strokeWidth="1.8"
        />
      )}

      {showPriceLine && snapshot && (
        <>
          {(shortage || surplus) && (
            <rect
              x={xOf(Math.min(snapshot.qd, snapshot.qs), qMax)}
              y={yOf(shownPrice, pMax)}
              width={Math.max(2, Math.abs(xOf(snapshot.qd, qMax) - xOf(snapshot.qs, qMax)))}
              height={HEIGHT - PAD.bottom - yOf(shownPrice, pMax)}
              fill={shortage ? 'rgba(226, 92, 92, 0.12)' : 'rgba(232, 133, 58, 0.12)'}
            />
          )}
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={yOf(shownPrice, pMax)}
            y2={yOf(shownPrice, pMax)}
            stroke="#172033"
            strokeDasharray="4 5"
            strokeWidth="1.4"
          />
          {showDemand && (
            <circle cx={xOf(snapshot.qd, qMax)} cy={yOf(shownPrice, pMax)} r="5" fill="#3b6fe8" />
          )}
          {showSupply && (
            <circle cx={xOf(snapshot.qs, qMax)} cy={yOf(shownPrice, pMax)} r="5" fill="#e8853a" />
          )}
        </>
      )}

      {ghostDemand && showDemand && (
        <path d={ghostDemand} fill="none" stroke="#9bb3f3" strokeWidth="2" strokeDasharray="6 6" />
      )}
      {ghostSupply && showSupply && (
        <path d={ghostSupply} fill="none" stroke="#f3c29a" strokeWidth="2" strokeDasharray="6 6" />
      )}
      {showDemand && <path d={demandPath} fill="none" stroke="#3b6fe8" strokeWidth="3" strokeLinecap="round" />}
      {showSupply && <path d={supplyPath} fill="none" stroke="#e8853a" strokeWidth="3" strokeLinecap="round" />}

      {eq && eq.price > 0 && eq.quantity > 0 && (
        <>
          <circle cx={xOf(eq.quantity, qMax)} cy={yOf(eq.price, pMax)} r="7" fill="#fff" stroke="#172033" strokeWidth="2.4" />
          <text x={xOf(eq.quantity, qMax) + 10} y={yOf(eq.price, pMax) - 8} fontSize="11" fill="#172033" fontWeight="700">
            {krw(eq.price)}
          </text>
        </>
      )}

      <text x="8" y="14" fontSize="11" fill="#667085">
        가격
      </text>
      <text x={WIDTH - 8} y={HEIGHT - 8} textAnchor="end" fontSize="11" fill="#667085">
        {onlyDemand ? '수량' : '수량'}
      </text>
    </svg>
  )
}
