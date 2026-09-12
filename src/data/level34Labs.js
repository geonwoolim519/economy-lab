import { krw } from '../lib/format.js'
import { computeGdp } from '../economicModels/gdp.js'
import { laborMarket } from '../economicModels/unemployment.js'
import { moneyScene } from '../economicModels/moneySupply.js'
import { cycleScene } from '../economicModels/businessCycle.js'
import { tradeFlow } from '../economicModels/trade.js'
import { statusLabel, tradeBalance } from '../economicModels/tradeBalance.js'
import { tariffScene } from '../economicModels/tariff.js'
import { ftaCompare } from '../economicModels/fta.js'
import { comparativeAdvantage } from '../economicModels/comparativeAdvantage.js'

function pill(text, tone = 'neutral') {
  return { text, tone }
}

function whyBlock({ headline, chain, termNote, principle }) {
  return { headline, chain, termNote, principle }
}

function topic(word) {
  const code = word.charCodeAt(word.length - 1)
  if (code < 0xac00 || code > 0xd7a3) return `${word}이`
  return (code - 0xac00) % 28 === 0 ? `${word}가` : `${word}이`
}

function oc(n) {
  if (!Number.isFinite(n)) return '—'
  return n.toFixed(2)
}

export const LEVEL34_EXTRA_STATE = {
  c: 500,
  iInv: 200,
  g: 150,
  x: 100,
  m: 80,
  hiring: 40,
  money: 100,
  phase: 1,
  krPrice: 10,
  usPrice: 15,
  freight: 2,
  exportsValue: 100,
  importsValue: 80,
  tariffRate: 10,
  ftaTariff: 0,
  krChip: 10,
  krWheat: 20,
  usChip: 6,
  usWheat: 18,
  tradeFx: 1300,
}

export const LEVEL34_LABS = [
  {
    id: 'gdp',
    level: 3,
    emoji: '📊',
    title: 'GDP',
    blurb: '나라 전체가 1년 동안 만들어 낸 가치를 어떻게 읽을까요?',
    available: true,
    nextLabId: 'cycle',
    conceptIds: ['gdp'],
    principles: [
      'GDP는 소비 + 투자 + 정부지출 + 순수출로 계산할 수 있습니다.',
      '수입이 늘면 순수출이 줄어 GDP를 낮출 수 있습니다.',
    ],
    steps: [
      {
        id: 'compose',
        question: '나라 전체가 1년 동안 만들어낸 가치는\n어떻게 계산할까요?',
        hint: '직접 움직여보세요. 소비·투자·정부지출·수출·수입을 바꾸면 GDP가 바로 변합니다.',
        seed: { c: 500, iInv: 200, g: 150, x: 100, m: 80 },
        controls: [
          { key: 'c', label: '소비 (C)', min: 300, max: 700, step: 10, format: (v) => `${v}` },
          { key: 'iInv', label: '투자 (I)', min: 80, max: 350, step: 10, format: (v) => `${v}` },
          { key: 'g', label: '정부지출 (G)', min: 50, max: 300, step: 10, format: (v) => `${v}` },
          { key: 'x', label: '수출 (X)', min: 40, max: 220, step: 10, format: (v) => `${v}` },
          { key: 'm', label: '수입 (M)', min: 20, max: 200, step: 10, format: (v) => `${v}` },
        ],
        evaluate: (state) => {
          const scene = computeGdp({ c: state.c, i: state.iInv, g: state.g, x: state.x, m: state.m })
          const base = 870
          const up = scene.gdp > base + 8
          const down = scene.gdp < base - 8
          const moves = [
            {
              label: '소비',
              delta: state.c - 500,
              upChain: ['소비가 늘어 사람들이 물건과 서비스를 더 많이 구매합니다.', '기업의 판매가 늘어납니다.', '경제 전체에서 생산된 가치가 커집니다.', 'GDP가 증가합니다.'],
              downChain: ['소비가 줄어 구매가 약해집니다.', '기업의 판매가 줄어들 수 있습니다.', '나라 전체의 생산 가치가 작아질 수 있습니다.', 'GDP가 감소할 수 있습니다.'],
            },
            {
              label: '투자',
              delta: state.iInv - 200,
              upChain: ['기업이 공장·장비에 더 많이 투자합니다.', '생산 능력이 커지고 관련 산업의 판매도 늘어납니다.', '나라 전체의 생산 가치가 커집니다.', 'GDP가 증가합니다.'],
              downChain: ['기업 투자가 줄어듭니다.', '공장·장비에 쓰는 돈이 감소합니다.', '관련 생산이 약해질 수 있습니다.', 'GDP가 감소할 수 있습니다.'],
            },
            {
              label: '정부지출',
              delta: state.g - 150,
              upChain: ['정부지출이 늘어 경제에 돈이 더 많이 들어옵니다.', '기업의 생산과 고용이 늘어날 수 있습니다.', '나라 전체의 생산이 증가합니다.', 'GDP가 증가합니다.'],
              downChain: ['정부지출이 줄어 경제로 들어오는 돈이 감소합니다.', '관련 생산과 고용이 약해질 수 있습니다.', 'GDP가 감소할 수 있습니다.'],
            },
            {
              label: '수출',
              delta: state.x - 100,
              upChain: ['해외에서 우리 상품을 더 많이 삽니다.', '국내 생산과 판매가 늘어납니다.', '순수출이 커지며 GDP가 증가합니다.'],
              downChain: ['수출이 줄어듭니다.', '순수출이 작아집니다.', '다른 조건이 같다면 GDP가 감소할 수 있습니다.'],
            },
            {
              label: '수입',
              delta: state.m - 80,
              upChain: ['해외에서 구매한 상품이 늘어납니다.', '순수출(수출-수입)이 줄어듭니다.', '다른 조건이 같다면 GDP는 감소할 수 있습니다.'],
              downChain: ['수입이 줄어듭니다.', '순수출이 커질 수 있습니다.', '다른 조건이 같다면 GDP는 증가할 수 있습니다.'],
            },
          ]
          const top = [...moves].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0]
          const moved = Math.abs(top.delta) >= 10
          const focus = moved ? top.label : '여러 항목'
          const chain = moved
            ? top.delta > 0
              ? top.upChain
              : top.downChain
            : ['GDP는 소비 + 투자 + 정부지출 + 순수출로 계산합니다.', '소비, 투자, 정부지출, 수출, 수입을 하나씩 움직여 보세요.']
          const principle =
            focus === '정부지출' && top.delta > 0
              ? '정부지출이 늘어나면 다른 조건이 같을 때 GDP가 증가할 수 있습니다.'
              : focus === '수입' && top.delta > 0
                ? '수입이 늘면 순수출이 줄어 다른 조건이 같을 때 GDP가 감소할 수 있습니다.'
                : 'GDP = 소비 + 투자 + 정부지출 + (수출 − 수입)입니다.'
          return {
            kind: 'hero',
            hero: {
              label: 'GDP',
              value: Math.round(scene.gdp).toLocaleString('ko-KR'),
              sub: `C+I+G+(X-M) · 순수출 ${scene.netExport}`,
              tone: up ? 'up' : down ? 'down' : '',
            },
            bars: [
              { key: 'c', label: '소비', value: (scene.c / 700) * 100, display: `${scene.c}`, color: '#3157D5' },
              { key: 'i', label: '투자', value: (scene.i / 350) * 100, display: `${scene.i}`, color: '#E8853A' },
              { key: 'g', label: '정부지출', value: (scene.g / 300) * 100, display: `${scene.g}`, color: '#1F9D61' },
              { key: 'nx', label: '순수출', value: 40 + scene.netExport, display: `${scene.netExport}`, color: '#667085' },
            ],
            stats: [
              pill(up ? 'GDP가 커졌습니다.' : down ? 'GDP가 작아졌습니다.' : '항목을 움직여 GDP 변화를 보세요.', up ? 'up' : down ? 'down' : 'neutral'),
              pill(`지금 가장 눈에 띄는 변화: ${focus}`, 'neutral'),
            ],
            why: whyBlock({
              headline: `${topic(focus)} 바뀌면 나라 전체 생산도 움직입니다`,
              chain,
              termNote: 'GDP는 한 나라에서 일정 기간 동안 새롭게 생산된 상품과 서비스의 가치를 보여주는 대표적인 지표입니다.',
              principle,
            }),
          }
        },
      },
    ],
  },
  {
    id: 'unemployment',
    level: 3,
    emoji: '💼',
    title: '실업률',
    blurb: '일을 찾고 있는데 일자리가 없으면 경제는 어떤 상태일까요?',
    available: true,
    nextLabId: 'cycle',
    conceptIds: ['unemployment'],
    principles: ['실업률은 실업자를 경제활동인구로 나눈 비율입니다.', '채용이 늘면 취업자가 늘고 실업률은 낮아질 수 있습니다.'],
    steps: [
      {
        id: 'hiring',
        question: '일자리를 찾는 사람이 많아지면\n경제는 어떻게 될까요?',
        hint: '직접 움직여보세요. 기업 채용 규모를 바꾸면 점의 색깔이 변합니다.',
        seed: { hiring: 40 },
        controls: [
          { key: 'hiring', label: '기업 채용 규모', min: 0, max: 100, step: 1, format: (v) => `${v}` },
        ],
        evaluate: (state) => {
          const scene = laborMarket(state.hiring)
          const high = state.hiring > 55
          const low = state.hiring < 30
          return {
            kind: 'people',
            ...scene,
            stats: [
              pill(high ? '채용이 늘어 취업자가 늘었습니다.' : low ? '채용이 줄어 실업자가 늘었습니다.' : '채용을 움직여 실업률을 보세요.', high ? 'up' : low ? 'down' : 'neutral'),
              pill(`실업률 ${scene.rate.toFixed(1)}%`, high ? 'up' : low ? 'warn' : 'neutral'),
            ],
            why: whyBlock({
              headline: high ? '일자리가 늘면 실업률이 내려갑니다' : '채용이 줄면 실업자가 늘어납니다',
              chain: high
                ? [
                    '기업 채용이 증가했습니다.',
                    '취업자가 늘어나고 실업자가 줄어듭니다.',
                    '경제활동인구 가운데 일자리를 찾는 사람의 비율이 낮아집니다.',
                    '실업률이 하락합니다.',
                  ]
                : [
                    '경기가 나빠지면 기업은 채용을 줄일 수 있습니다.',
                    '일을 원하지만 직장이 없는 사람이 늘어납니다.',
                    '실업률 = 실업자 ÷ 경제활동인구 × 100 으로 계산합니다.',
                  ],
              termNote: '경제활동인구는 일을 하고 있거나, 일을 찾고 있는 사람을 말합니다.',
              principle: '채용 증가 → 취업자 증가 → 실업률 하락',
            }),
          }
        },
      },
    ],
  },
  {
    id: 'money',
    level: 3,
    emoji: '💵',
    title: '통화량',
    blurb: '시중에 돈이 많아지면 물가와 금리는 어떻게 연결될까요?',
    available: true,
    nextLabId: 'inflation',
    conceptIds: ['money'],
    principles: [
      '시중에 돈이 늘면 소비와 경제활동이 커질 수 있습니다.',
      '시간이 지나며 물가 상승 압력이 커질 수도 있지만, 통화량만으로 물가가 결정되지는 않습니다.',
    ],
    steps: [
      {
        id: 'supply',
        question: '시중에 돈이 많아지면\n경제에는 어떤 일이 생길까요?',
        hint: '직접 움직여보세요. 통화량을 바꾸면 소비·물가·금리의 방향이 보입니다.',
        seed: { money: 100 },
        controls: [
          { key: 'money', label: '통화량', min: 80, max: 140, step: 1, format: (v) => `${v}` },
        ],
        evaluate: (state) => {
          const scene = moneyScene(state.money)
          const up = state.money > 108
          const down = state.money < 92
          return {
            kind: 'hero',
            hero: { label: '통화량', value: `${scene.supply}`, sub: '시중에 돌아다니는 돈의 양', tone: up ? 'up' : down ? 'down' : '' },
            bars: [
              { key: 'spend', label: '소비', value: scene.spending, display: `${scene.spending}`, color: '#3157D5' },
              { key: 'act', label: '경제활동', value: scene.activity, display: `${scene.activity}`, color: '#1F9D61' },
              { key: 'p', label: '물가 압력', value: scene.prices, display: `${scene.prices}`, color: '#E25C5C' },
              { key: 'r', label: '금리 압력', value: scene.rate, display: `${scene.rate}`, color: '#E8853A' },
            ],
            footnote: '실제 경제에서는 통화량 외에도 생산량, 기대인플레이션, 금리 등 여러 요인이 함께 영향을 줍니다.',
            stats: [
              pill(up ? '쓸 수 있는 돈이 늘었습니다.' : down ? '시중 돈이 줄었습니다.' : '통화량을 80에서 140까지 움직여 보세요.', up ? 'up' : down ? 'down' : 'neutral'),
              pill(up ? '소비와 경제활동이 커질 수 있습니다.' : down ? '소비와 경제활동이 가라앉을 수 있습니다.' : '물가와 금리의 방향을 함께 보세요.', up ? 'up' : down ? 'down' : 'neutral'),
            ],
            why: whyBlock({
              headline: up ? '돈이 늘면 당장은 활발해질 수 있어요' : '돈이 줄면 지출이 조심스러워집니다',
              chain: up
                ? [
                    '통화량이 증가했습니다.',
                    '사람들이 사용할 수 있는 돈이 늘어납니다.',
                    '소비와 투자가 늘어날 수 있습니다.',
                    '경제활동이 커질 수 있습니다.',
                    '시간이 지나면서 물가 상승 압력이 커질 수도 있습니다.',
                  ]
                : [
                    '통화량이 감소하면 쓸 수 있는 돈이 줄어듭니다.',
                    '소비와 투자가 약해질 수 있습니다.',
                    '물가 압력은 낮아질 수 있지만, 경제활동도 함께 식습니다.',
                  ],
              termNote: '시중에 돈이 얼마나 있는지를 통화량이라고 합니다. 물가는 통화량만으로 단정할 수 없습니다.',
              principle: '통화량 증가 → 소비·투자 증가 가능 → 물가 압력 증가 가능',
            }),
          }
        },
      },
    ],
  },
  {
    id: 'cycle',
    level: 3,
    emoji: '🌊',
    title: '경기변동',
    blurb: '경제는 왜 늘 같은 속도로 달리지 않을까요?',
    available: true,
    nextLabId: 'unemployment',
    conceptIds: ['cycle'],
    principles: [
      '경기는 회복-호황-둔화-침체를 반복하며 움직입니다.',
      '호황에는 소비·투자·고용이 함께 커지고, 침체에는 함께 줄어들 수 있습니다.',
    ],
    steps: [
      {
        id: 'phase',
        question: '경제는 왜 계속 같은 속도로\n성장하지 않을까요?',
        hint: '직접 움직여보세요. 회복 → 호황 → 둔화 → 침체를 옮겨 보세요.',
        seed: { phase: 1 },
        controls: [
          {
            key: 'phase',
            label: '경기 상태',
            min: 0,
            max: 3,
            step: 1,
            format: (v) => ['회복', '호황', '둔화', '침체'][Math.round(v)],
          },
        ],
        evaluate: (state) => {
          const scene = cycleScene(state.phase)
          const boom = scene.id === 'boom'
          const rec = scene.id === 'recession'
          return {
            kind: 'cycle',
            ...scene,
            bars: [
              { key: 'p', label: '생산', value: scene.production, display: `${scene.production}`, color: '#3157D5' },
              { key: 'c', label: '소비', value: scene.consumption, display: `${scene.consumption}`, color: '#1F9D61' },
              { key: 'i', label: '투자', value: scene.investment, display: `${scene.investment}`, color: '#E8853A' },
              { key: 'e', label: '고용', value: scene.employment, display: `${scene.employment}`, color: '#667085' },
            ],
            stats: [
              pill(`지금은 ${scene.label} 구간입니다.`, boom ? 'up' : rec ? 'down' : 'neutral'),
              pill(boom ? '소비·투자·고용이 함께 커집니다.' : rec ? '소비·투자·고용이 함께 줄어듭니다.' : '곡선 위의 점이 시간을 따라 이동합니다.', boom ? 'up' : rec ? 'down' : 'neutral'),
            ],
            why: whyBlock({
              headline: '경기는 한 방향으로만 가지 않아요',
              chain: boom
                ? ['호황에서는 소비가 늘어납니다.', '기업은 투자를 늘립니다.', '고용도 함께 증가합니다.']
                : rec
                  ? ['침체에서는 소비가 줄어듭니다.', '기업은 투자를 미룹니다.', '고용도 약해질 수 있습니다.']
                  : [
                      '경제활동은 시간에 따라 확장과 수축을 반복합니다.',
                      '회복 → 호황 → 둔화 → 침체 → 다시 회복으로 이어질 수 있습니다.',
                    ],
              termNote: '이 반복을 경제학에서는 경기변동(또는 경기순환)이라고 합니다.',
              principle: '경기변동은 경제활동이 시간에 따라 확장과 수축을 반복하는 현상입니다.',
            }),
          }
        },
      },
    ],
  },
  {
    id: 'trade',
    level: 4,
    emoji: '🚢',
    title: '수출과 수입',
    blurb: '나라 사이에서 물건이 오가면 가격과 후생은 어떻게 바뀔까요?',
    available: true,
    nextLabId: 'balance',
    conceptIds: ['trade'],
    principles: ['가격이 더 싼 나라에서 비싼 나라로 상품이 이동하려는 힘이 생깁니다.', '운송비가 너무 크면 무역 유인이 사라질 수 있습니다.'],
    steps: [
      {
        id: 'flow',
        question: '나라 사이에 물건이 오가면\n가격과 수량은 어떻게 바뀔까요?',
        hint: '직접 움직여보세요. 한국·미국 가격, 운송비, 환율을 바꿔 화살표 방향을 보세요.',
        seed: { krPrice: 10, usPrice: 15, freight: 2, tradeFx: 1300 },
        controls: [
          { key: 'krPrice', label: '한국 가격', min: 5, max: 20, step: 1, format: (v) => `${v}` },
          { key: 'usPrice', label: '미국 가격', min: 5, max: 20, step: 1, format: (v) => `${v}` },
          { key: 'freight', label: '운송비', min: 0, max: 8, step: 1, format: (v) => `${v}` },
          { key: 'tradeFx', label: '원/달러 환율', min: 1000, max: 1600, step: 10, format: (v) => `${Math.round(v).toLocaleString('ko-KR')}원` },
        ],
        evaluate: (state) => {
          const usInKrw = Number((state.usPrice * (state.tradeFx / 1300)).toFixed(1))
          const scene = tradeFlow({ krPrice: state.krPrice, usPrice: usInKrw, freight: state.freight })
          const exp = scene.direction === 'export'
          const imp = scene.direction === 'import'
          return {
            kind: 'trade',
            krPrice: scene.krPrice,
            usPrice: scene.usPrice,
            fxLabel: `환율 1달러 = ${Math.round(state.tradeFx).toLocaleString('ko-KR')}원 · 미국 표시가격 ${state.usPrice}`,
            arrow: exp ? '🚢 →' : imp ? '← 🚢' : '·',
            message: exp
              ? '한국 상품을 미국에 수출할 유인이 생깁니다.'
              : imp
                ? '미국 상품을 한국으로 수입할 유인이 생깁니다.'
                : '가격 차이가 운송비보다 작아 무역 유인이 약합니다.',
            stats: [
              pill(exp ? '수출 방향입니다.' : imp ? '수입 방향입니다.' : '가격·환율·운송비를 더 움직여 보세요.', exp ? 'up' : imp ? 'down' : 'neutral'),
              pill(`운송비 ${scene.freight}`, 'neutral'),
            ],
            why: whyBlock({
              headline: exp ? '싼 곳에서 비싼 곳으로 물건이 갑니다' : '무역은 가격 차이에서 시작됩니다',
              chain: exp
                ? [
                    `한국 가격(${scene.krPrice})이 미국 가격 원화 환산(${scene.usPrice})보다 낮습니다.`,
                    '그 차이가 운송비보다 크면 수출할 이유가 생깁니다.',
                    '환율이 오르면 미국 상품의 원화 가격이 더 비싸져 수출 유인이 커질 수 있습니다.',
                    '상품이 한국에서 미국으로 이동합니다.',
                  ]
                : [
                    '나라 사이 가격이 다르면 상품이 이동하려고 합니다.',
                    '환율이 바뀌면 미국 가격을 원화로 환산한 값이 달라집니다.',
                    '운송비가 너무 크면 그 힘이 사라집니다.',
                    '화살표가 어느 쪽을 가리키는지 관찰해 보세요.',
                  ],
              termNote: '한 나라에서 다른 나라로 상품을 파는 것을 수출, 사 오는 것을 수입이라고 합니다.',
              principle: '상대 가격이 낮고 운송비가 작으면 수출 유인이 생깁니다.',
            }),
          }
        },
      },
    ],
  },
  {
    id: 'balance',
    level: 4,
    emoji: '⚖️',
    title: '무역수지',
    blurb: '수출이 수입보다 많다는 말은 얼마나 많은 이야기일까요?',
    available: true,
    nextLabId: 'tariff',
    conceptIds: ['balance'],
    principles: ['무역수지는 수출에서 수입을 뺀 값입니다.', '흑자와 적자는 “좋다/나쁘다”가 아니라 흐름의 차이를 보여 줍니다.'],
    steps: [
      {
        id: 'nx',
        question: '수출이 수입보다 많다면\n무역수지는 어떻게 될까요?',
        hint: '직접 움직여보세요. 수출과 수입 슬라이더로 흑자·균형·적자를 만들어 보세요.',
        seed: { exportsValue: 100, importsValue: 80 },
        controls: [
          { key: 'exportsValue', label: '수출', min: 40, max: 160, step: 5, format: (v) => `${v}` },
          { key: 'importsValue', label: '수입', min: 40, max: 160, step: 5, format: (v) => `${v}` },
        ],
        evaluate: (state) => {
          const scene = tradeBalance(state.exportsValue, state.importsValue)
          const label = statusLabel(scene.status)
          const tone = scene.status === 'surplus' ? 'up' : scene.status === 'deficit' ? 'down' : 'neutral'
          return {
            kind: 'hero',
            hero: {
              label: '무역수지',
              value: `${scene.balance > 0 ? '+' : ''}${scene.balance}`,
              sub: label,
              tone,
            },
            bars: [
              { key: 'x', label: '수출', value: (scene.exportsValue / 160) * 100, display: `${scene.exportsValue}`, color: '#1F9D61' },
              { key: 'm', label: '수입', value: (scene.importsValue / 160) * 100, display: `${scene.importsValue}`, color: '#E25C5C' },
            ],
            stats: [
              pill(`지금은 ${label}입니다.`, tone),
              pill('무역적자를 무조건 나쁜 것으로 보지 마세요.', 'neutral'),
            ],
            why: whyBlock({
              headline: '수출과 수입의 차이가 무역수지예요',
              chain: [
                `수출 ${scene.exportsValue}, 수입 ${scene.importsValue}입니다.`,
                '무역수지 = 수출 − 수입 입니다.',
                scene.status === 'surplus'
                  ? '수출이 더 많아 무역흑자입니다.'
                  : scene.status === 'deficit'
                    ? '수입이 더 많아 무역적자입니다.'
                    : '수출과 수입이 비슷해 무역균형에 가깝습니다.',
              ],
              termNote: '무역수지는 한 나라의 수출과 수입의 차이를 보여주는 지표입니다. 적자가 항상 실패를 뜻하지는 않습니다.',
              principle: '수출 > 수입 → 무역흑자, 수출 < 수입 → 무역적자',
            }),
          }
        },
      },
    ],
  },
  {
    id: 'tariff',
    level: 4,
    emoji: '🧱',
    title: '관세',
    blurb: '수입품에 세금을 매기면 국내 가격과 거래량은 어떻게 될까요?',
    available: true,
    nextLabId: 'fta',
    conceptIds: ['tariff'],
    principles: ['관세는 수입품 가격을 올려 수입량을 줄일 수 있습니다.', '국내 생산자는 보호될 수 있지만 소비자는 더 비싸게 살 수 있습니다.'],
    steps: [
      {
        id: 'rate',
        question: '수입품에 세금을 매기면\n국내 가격과 거래량은 어떻게 될까요?',
        hint: '직접 움직여보세요. 관세를 0%에서 올려 국내 판매가격을 확인하세요.',
        seed: { tariffRate: 0 },
        controls: [
          { key: 'tariffRate', label: '관세율', min: 0, max: 40, step: 1, format: (v) => `${v}%` },
        ],
        evaluate: (state) => {
          const scene = tariffScene(state.tariffRate)
          const on = state.tariffRate > 3
          return {
            kind: 'hero',
            hero: {
              label: '국내 판매가격',
              value: krw(scene.domesticPrice),
              sub: `해외 가격 ${krw(scene.worldPrice)} + 관세 ${scene.rate}%`,
              tone: on ? 'down' : '',
            },
            bars: [
              { key: 'c', label: '소비자 부담', value: scene.consumerBurden, display: `${Math.round(scene.consumerBurden)}`, color: '#E25C5C' },
              { key: 'p', label: '국내 생산자', value: scene.producer, display: `${Math.round(scene.producer)}`, color: '#1F9D61' },
              { key: 'q', label: '수입량', value: scene.importQty, display: `${Math.round(scene.importQty)}`, color: '#3157D5' },
              { key: 'r', label: '정부 관세수입', value: Math.min(100, scene.revenue / 80), display: krw(scene.revenue), color: '#E8853A' },
            ],
            stats: [
              pill(on ? '수입품 가격이 올랐습니다.' : '관세를 올려 국제무역 효과를 보세요.', on ? 'down' : 'neutral'),
              pill(on ? '수입량은 줄고 국내 생산자는 숨을 고를 수 있습니다.' : '소비자와 생산자, 정부 수입을 함께 보세요.', on ? 'warn' : 'neutral'),
            ],
            why: whyBlock({
              headline: on ? '관세는 국경에서 붙는 세금입니다' : '관세를 조금 더 올려보세요',
              chain: [
                '수입품에 관세가 붙습니다.',
                '국내에서 보이는 수입품 가격이 상승합니다.',
                '수입량이 감소할 수 있습니다.',
                '국내 생산자는 보호되는 효과가 있을 수 있습니다.',
                '소비자는 더 비싸게 사게 되고, 정부는 관세수입을 얻을 수 있습니다.',
              ],
              termNote: '관세는 수입 상품에 매기는 세금입니다. 이번 실험은 나라 안 세금이 아니라 국제무역에 초점을 둡니다.',
              principle: '관세 ↑ → 수입품 가격 ↑ → 수입량 ↓ · 소비자 부담 ↑',
            }),
          }
        },
      },
    ],
  },
  {
    id: 'fta',
    level: 4,
    emoji: '🤝',
    title: 'FTA',
    blurb: '나라 사이 장벽이 낮아지면 누가 이득을 볼까요?',
    available: true,
    nextLabId: 'advantage',
    conceptIds: ['fta'],
    principles: [
      '관세가 낮아지면 수입품 가격이 내려가고 무역량이 늘 수 있습니다.',
      '소비자는 선택지가 늘지만, 국내 경쟁 산업에는 부담이 생길 수 있습니다.',
    ],
    steps: [
      {
        id: 'cut',
        question: '나라 사이의 관세가 낮아지면\n누가 이득을 볼까요?',
        hint: '직접 움직여보세요. FTA 전(10%)과 비교해 관세를 낮춰 보세요.',
        seed: { ftaTariff: 0 },
        controls: [
          { key: 'ftaTariff', label: 'FTA 후 관세율', min: 0, max: 20, step: 1, format: (v) => `${v}%` },
        ],
        evaluate: (state) => {
          const scene = ftaCompare(state.ftaTariff)
          const opened = state.ftaTariff < 8
          return {
            kind: 'compare',
            leftTitle: 'FTA 전',
            rightTitle: 'FTA 후',
            left: [
              { label: '가격', value: krw(scene.before.domesticPrice) },
              { label: '수입량', value: `${Math.round(scene.before.importQty)}` },
              { label: '소비자 부담', value: `${Math.round(scene.before.consumerBurden)}` },
              { label: '국내 생산자', value: `${Math.round(scene.before.producer)}` },
            ],
            right: [
              { label: '가격', value: krw(scene.after.domesticPrice) },
              { label: '수입량', value: `${Math.round(scene.after.importQty)}` },
              { label: '소비자 부담', value: `${Math.round(scene.after.consumerBurden)}` },
              { label: '국내 생산자', value: `${Math.round(scene.after.producer)}` },
            ],
            stats: [
              pill(opened ? '장벽이 낮아져 수입품이 싸졌습니다.' : '관세를 더 낮춰 FTA 효과를 보세요.', opened ? 'up' : 'neutral'),
              pill(opened ? '소비자는 이득, 일부 국내 산업은 경쟁이 커집니다.' : '왼쪽은 관세 10%, 오른쪽은 지금 설정입니다.', opened ? 'warn' : 'neutral'),
            ],
            why: whyBlock({
              headline: '관세가 낮아지면 문이 넓어집니다',
              chain: [
                'FTA로 나라 사이 관세가 낮아집니다.',
                '수입품 가격이 내려갑니다.',
                '소비자의 선택이 늘어나고 무역량이 커질 수 있습니다.',
                '다만 값싼 수입품과 경쟁하는 국내 산업에는 부담이 생길 수 있습니다.',
              ],
              termNote: 'FTA(자유무역협정)는 나라 사이 무역 장벽을 낮추기로 약속하는 협정입니다.',
              principle: '관세 ↓ → 수입품 가격 ↓ → 무역량 증가 가능 · 국내 경쟁 산업 부담 가능',
            }),
          }
        },
      },
    ],
  },
  {
    id: 'advantage',
    level: 4,
    emoji: '🏭',
    title: '비교우위',
    blurb: '더 잘 만드는 것보다, 덜 포기하고 만드는 것이 왜 중요할까요?',
    available: true,
    nextLabId: 'trade',
    conceptIds: ['advantage'],
    principles: [
      '절대우위는 “더 많이 만들 수 있는가”, 비교우위는 “무엇을 덜 포기하는가”입니다.',
      '비교우위에 맞춰 특화하고 무역하면 전체 생산량이 늘어날 수 있습니다.',
    ],
    steps: [
      {
        id: 'oc',
        question: '둘 다 잘하는 나라가\n왜 무역을 할까요?',
        hint: '직접 움직여보세요. 두 나라의 반도체·밀 생산량을 바꿔 기회비용을 비교하세요.',
        seed: { krChip: 10, krWheat: 20, usChip: 6, usWheat: 18 },
        controls: [
          { key: 'krChip', label: '한국 반도체', min: 4, max: 16, step: 1, format: (v) => `${v}` },
          { key: 'krWheat', label: '한국 밀', min: 8, max: 30, step: 1, format: (v) => `${v}` },
          { key: 'usChip', label: '미국 반도체', min: 3, max: 14, step: 1, format: (v) => `${v}` },
          { key: 'usWheat', label: '미국 밀', min: 8, max: 30, step: 1, format: (v) => `${v}` },
        ],
        evaluate: (state) => {
          const scene = comparativeAdvantage(state)
          const krChip = scene.krChipAdvantage
          return {
            kind: 'hero',
            hero: {
              label: '특화 후 세계 생산',
              value: `반도체 ${scene.specializedTotal.chip.toFixed(0)} · 밀 ${scene.specializedTotal.wheat.toFixed(0)}`,
              sub: `무역 전(반반): 반도체 ${scene.autarkyTotal.chip.toFixed(1)} · 밀 ${scene.autarkyTotal.wheat.toFixed(1)}`,
              tone: 'up',
              wide: true,
            },
            grid: [
              { label: '한국 반도체 기회비용', value: `밀 ${oc(scene.krChipOc)}` },
              { label: '미국 반도체 기회비용', value: `밀 ${oc(scene.usChipOc)}` },
              { label: '한국 비교우위', value: krChip ? '반도체' : '밀' },
              { label: '미국 비교우위', value: krChip ? '밀' : '반도체' },
            ],
            stats: [
              pill(scene.krAbsChip && scene.krAbsWheat ? '한국이 둘 다 더 많이 만들 수 있어도, 무역 이유는 남습니다.' : '기회비용이 더 작은 상품이 비교우위입니다.', 'neutral'),
              pill(`한국은 ${krChip ? '반도체' : '밀'}에 비교우위가 있습니다.`, 'up'),
            ],
            why: whyBlock({
              headline: '더 잘하는 것과 덜 포기하는 것은 다릅니다',
              chain: [
                scene.krAbsChip && scene.krAbsWheat
                  ? '한 나라가 두 상품을 모두 더 잘 만들더라도(절대우위), 기회비용은 다를 수 있습니다.'
                  : '절대우위는 누가 더 많이 만드는지를 봅니다.',
                `한국이 반도체 1을 만들 때 포기하는 밀은 ${oc(scene.krChipOc)}, 미국은 ${oc(scene.usChipOc)}입니다.`,
                '상대적으로 더 적은 것을 포기하고 만들 수 있는 상품에 비교우위가 있습니다.',
                '각자 비교우위 상품에 특화한 뒤 무역하면, 세계 전체 생산량이 늘어날 수 있습니다.',
              ],
              termNote: '절대우위는 “더 잘 만듦”, 비교우위는 “기회비용이 더 낮음”입니다.',
              principle: '기회비용 비교 → 비교우위 → 특화 → 무역 → 전체 생산 증가 가능',
            }),
          }
        },
      },
    ],
  },
]
