import MarketGraph from './MarketGraph.jsx'
import { krw, pct } from '../lib/format.js'
import { cycleWavePoints } from '../economicModels/businessCycle.js'

export function MarketPanel({ view }) {
  return (
    <div className="card graph-card">
      <MarketGraph
        market={view.market}
        ghostMarket={view.ghostMarket}
        price={view.showPriceLine ? view.price : view.eq?.price}
        showDemand={view.showDemand}
        showSupply={view.showSupply}
        showEq={view.showEq}
        showPriceLine={view.showPriceLine}
        ceiling={view.ceiling}
        floor={view.floor}
        onlyDemand={!view.showSupply}
      />
      <div className="legend">
        {view.showDemand && (
          <span>
            <i style={{ background: '#3b6fe8' }} />
            사고 싶은 양
          </span>
        )}
        {view.showSupply && (
          <span>
            <i style={{ background: '#e8853a' }} />
            팔고 싶은 양
          </span>
        )}
        {view.showEq && (
          <span>
            <i style={{ background: '#172033', height: 8, width: 8, borderRadius: 99 }} />
            균형
          </span>
        )}
      </div>
    </div>
  )
}

export function BarsPanel({ view }) {
  return (
    <div className="card graph-card">
      <div className="bar-list">
        {view.bars.map((bar) => (
          <div className="bar-row" key={bar.key}>
            <span>
              <b>{bar.label}</b>
              <b>{bar.display}</b>
            </span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.max(6, Math.min(100, bar.value))}%`, background: bar.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ElasticityPanel({ view }) {
  const demandMarket = {
    demandA: view.good.a,
    demandB: view.good.b,
    supplyA: -80,
    supplyB: 0.002,
  }

  return (
    <div className="card graph-card">
      <MarketGraph
        market={demandMarket}
        price={view.price}
        showDemand
        showSupply={false}
        showEq={false}
        showPriceLine
        onlyDemand
        qMax={90}
        pMax={18000}
      />
      <div className="legend">
        <span>
          <i style={{ background: '#3b6fe8' }} />
          {view.good.name}을 사고 싶은 양
        </span>
      </div>
      <div className="el-grid">
        <div className="el-stat">
          <small>가격</small>
          <b>{krw(view.price)}</b>
        </div>
        <div className="el-stat">
          <small>수요량</small>
          <b>{Math.round(view.quantity)}</b>
        </div>
        <div className="el-stat">
          <small>탄력성</small>
          <b>{Number.isFinite(view.elasticity) ? view.elasticity.toFixed(2) : '∞'}</b>
        </div>
        <div className="el-stat">
          <small>총수입</small>
          <b>{krw(view.tr)}</b>
        </div>
      </div>
      {view.compare && (
        <div className="el-grid">
          <div className="el-stat">
            <small>가격 변화</small>
            <b>{pct(view.compare.dP)}</b>
          </div>
          <div className="el-stat">
            <small>수요량 변화</small>
            <b>{pct(view.compare.dQ)}</b>
          </div>
          <div className="el-stat">
            <small>총수입 변화</small>
            <b>{pct(view.compare.dTR)}</b>
          </div>
          <div className="el-stat">
            <small>성격</small>
            <b>{view.classLabel}</b>
          </div>
        </div>
      )}
    </div>
  )
}

function BarList({ bars }) {
  if (!bars?.length) return null
  return (
    <div className="bar-list">
      {bars.map((bar) => (
        <div className="bar-row" key={bar.key}>
          <span>
            <b>{bar.label}</b>
            <b>{bar.display}</b>
          </span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.max(6, Math.min(100, bar.value))}%`, background: bar.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HeroPanel({ view }) {
  return (
    <div className="card graph-card">
      <div className={`hero-metric ${view.hero.tone || ''} ${view.hero.wide ? 'wide' : ''}`}>
        <small>{view.hero.label}</small>
        <b>{view.hero.value}</b>
        {view.hero.sub && <span>{view.hero.sub}</span>}
      </div>
      <BarList bars={view.bars} />
      {view.grid && (
        <div className="el-grid">
          {view.grid.map((item) => (
            <div className="el-stat" key={item.label}>
              <small>{item.label}</small>
              <b>{item.value}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function PeoplePanel({ view }) {
  const filled = Math.round((view.employed / view.laborForce) * 10)
  return (
    <div className="card graph-card">
      <div className="hero-metric">
        <small>실업률</small>
        <b>{view.rate.toFixed(1)}%</b>
        <span>
          취업 {view.employed} · 실업 {view.unemployed} · 경제활동인구 {view.laborForce}
        </span>
      </div>
      <div className="people-row" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={i < filled ? 'person on' : 'person'}>
            ●
          </span>
        ))}
      </div>
      <p className="tiny" style={{ padding: '0 8px 8px' }}>
        색이 있는 점은 취업, 회색은 실업입니다.
      </p>
    </div>
  )
}

export function CyclePanel({ view }) {
  const width = 320
  const height = 150
  const { points, pad, innerW, mid, amp } = cycleWavePoints(width, height)
  const t = (view.index + 0.5) / 4
  const x = pad + t * innerW
  const y = mid - Math.sin(t * Math.PI * 2) * amp
  return (
    <div className="card graph-card">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="경기순환 그래프" style={{ width: '100%' }}>
        <text x="8" y="16" fontSize="11" fill="#667085">
          경제활동
        </text>
        <polyline fill="none" stroke="#3157d5" strokeWidth="3" strokeLinejoin="round" points={points} />
        <circle cx={x} cy={y} r="7" fill="#fff" stroke="#172033" strokeWidth="2.4" />
        <text x={width - 8} y={height - 8} textAnchor="end" fontSize="11" fill="#667085">
          시간
        </text>
      </svg>
      <div className="legend">
        <span>지금: {view.label}</span>
      </div>
      <BarList bars={view.bars} />
    </div>
  )
}

export function TradePanel({ view }) {
  return (
    <div className="card graph-card">
      <div className="trade-row">
        <div className="el-stat">
          <small>한국 가격</small>
          <b>{view.krPrice}</b>
        </div>
        <div className="trade-arrow">{view.arrow}</div>
        <div className="el-stat">
          <small>미국 가격(원화 환산)</small>
          <b>{view.usPrice}</b>
        </div>
      </div>
      {view.fxLabel && (
        <p className="tiny" style={{ padding: '0 12px', margin: 0 }}>
          {view.fxLabel}
        </p>
      )}
      <p className="lede" style={{ padding: '4px 8px 12px', margin: 0 }}>
        {view.message}
      </p>
    </div>
  )
}

export function ComparePanel({ view }) {
  return (
    <div className="card graph-card">
      <div className="el-grid">
        {view.left.map((item) => (
          <div className="el-stat" key={`l-${item.label}`}>
            <small>{view.leftTitle} · {item.label}</small>
            <b>{item.value}</b>
          </div>
        ))}
        {view.right.map((item) => (
          <div className="el-stat" key={`r-${item.label}`}>
            <small>{view.rightTitle} · {item.label}</small>
            <b>{item.value}</b>
          </div>
        ))}
      </div>
    </div>
  )
}
