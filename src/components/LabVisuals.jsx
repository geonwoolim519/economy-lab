import MarketGraph from './MarketGraph.jsx'
import { krw, pct } from '../lib/format.js'

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
