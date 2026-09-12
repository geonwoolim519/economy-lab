import { krw, near, pct, qty } from '../lib/format.js'
import {
  CHICKEN,
  costShiftFromWon,
  equilibrium,
  gap,
  incomeShiftFromManwon,
  trendFromDelta,
  withShifts,
} from '../economicModels/supplyDemand.js'
import {
  GOODS,
  classifyElasticity,
  elasticityLabel,
  percentChange,
  pointElasticity,
  quantityAt,
  totalRevenue,
} from '../economicModels/elasticity.js'
import { ceilingOutcome, floorOutcome } from '../economicModels/priceControl.js'
import { exchangeScene, inflationScene, interestScene } from '../economicModels/macro.js'
import { LEVEL34_EXTRA_STATE, LEVEL34_LABS } from './level34Labs.js'

export const DEFAULT_STATE = {
  price: 10000,
  incomeManwon: 200,
  costWon: 4000,
  tax: 0,
  subsidy: 0,
  ceiling: 9000,
  floor: 16000,
  rate: 3.5,
  heat: 30,
  dollarHeat: 35,
  goodId: 'ramen',
  ...LEVEL34_EXTRA_STATE,
}

export function chickenMarket(state) {
  return withShifts(CHICKEN, {
    income: incomeShiftFromManwon(state.incomeManwon),
    cost: costShiftFromWon(state.costWon),
    tax: state.tax,
    subsidy: state.subsidy,
  })
}

function pill(text, tone = 'neutral') {
  return { text, tone }
}

function whyBlock({ headline, chain, termNote, principle }) {
  return { headline, chain, termNote, principle }
}

function marketView(state, extra = {}) {
  const market = chickenMarket(state)
  const eq = equilibrium(market)
  const snapshot = gap(market, extra.price ?? state.price)
  return {
    kind: 'market',
    market,
    ghostMarket: extra.ghost ? CHICKEN : null,
    price: extra.price ?? state.price,
    showDemand: extra.showDemand ?? true,
    showSupply: extra.showSupply ?? true,
    showPriceLine: extra.showPriceLine ?? true,
    showEq: extra.showEq ?? true,
    ceiling: extra.ceiling ?? null,
    floor: extra.floor ?? null,
    unit: '만 마리',
    eq,
    gap: snapshot,
    stats: extra.stats ?? [],
    why: extra.why,
    note: extra.note ?? '',
  }
}

function whyByPrice(state) {
  const market = chickenMarket(state)
  const eq = equilibrium(market)
  if (near(state.price, eq.price, 450)) {
    return whyBlock({
      headline: '사고 싶은 양과 팔고 싶은 양이 만났어요',
      chain: [
        '지금 가격에서 치킨을 사려는 사람과 팔려는 사람의 마음이 거의 같습니다.',
        '남거나 부족한 양이 거의 없어, 거래가 가장 자연스럽게 이뤄집니다.',
        '서로 원하는 양이 만나는 이 가격이 균형가격입니다.',
        '그때 실제로 오가는 양이 균형수량입니다.',
      ],
      termNote: '수요량과 공급량이 같아지는 상태를 경제학에서는 균형이라고 합니다.',
      principle: '균형에서는 사고 싶은 양과 팔고 싶은 양이 같습니다.',
    })
  }
  if (state.price > eq.price) {
    return whyBlock({
      headline: '가격이 높아지니 치킨이 남아요',
      chain: [
        '치킨 가격이 올라갔습니다.',
        '소비자는 “너무 비싸다”고 느껴 사는 양을 줄입니다.',
        '판매자는 “이 가격이면 더 팔고 싶다”고 느껴 내놓는 양을 늘립니다.',
        '팔고 싶은 양이 사고 싶은 양보다 많아집니다.',
        '시장에 치킨이 남습니다.',
      ],
      termNote: '팔고 싶은 양이 사고 싶은 양보다 많은 상태를 초과공급이라고 합니다.',
      principle: '가격 상승 → 수요량 감소 · 공급량 증가 → 초과공급',
    })
  }
  return whyBlock({
    headline: '가격이 낮아지니 치킨이 모자라요',
    chain: [
      '치킨 가격이 내려갔습니다.',
      '소비자는 더 사고 싶어 합니다.',
      '판매자는 이 가격에 많이 팔고 싶지 않아 내놓는 양을 줄입니다.',
      '사고 싶은 양이 팔고 싶은 양보다 많아집니다.',
      '시장에서 치킨이 부족해집니다.',
    ],
    termNote: '사고 싶은 양이 팔고 싶은 양보다 많은 상태를 초과수요라고 합니다.',
    principle: '가격 하락 → 수요량 증가 · 공급량 감소 → 초과수요',
  })
}

function priceStats(state) {
  const market = chickenMarket(state)
  const eq = equilibrium(market)
  const snapshot = gap(market, state.price)
  const priceTone = trendFromDelta(state.price - eq.price, 400)
  const pills = []

  if (near(state.price, eq.price, 450)) {
    pills.push(pill('지금은 균형에 가까워요.', 'neutral'))
    pills.push(pill('사고 싶은 양과 팔고 싶은 양이 거의 같습니다.', 'up'))
  } else if (state.price > eq.price) {
    pills.push(pill('가격이 균형보다 높아요.', 'down'))
    pills.push(pill(`사고 싶은 양 ${qty(snapshot.qd)}만 마리`, 'down'))
    pills.push(pill(`팔고 싶은 양 ${qty(snapshot.qs)}만 마리`, 'up'))
    pills.push(pill(`치킨이 ${qty(snapshot.excessSupply)}만 마리 남습니다.`, 'warn'))
  } else {
    pills.push(pill('가격이 균형보다 낮아요.', 'up'))
    pills.push(pill(`사고 싶은 양 ${qty(snapshot.qd)}만 마리`, 'up'))
    pills.push(pill(`팔고 싶은 양 ${qty(snapshot.qs)}만 마리`, 'down'))
    pills.push(pill(`치킨이 ${qty(snapshot.excessDemand)}만 마리 부족합니다.`, 'warn'))
  }
  return pills
}

const PRICE_CONTROL = {
  key: 'price',
  label: '치킨 가격',
  min: 8000,
  max: 22000,
  step: 100,
  format: (v) => krw(v),
}

export const LABS = [
  {
    id: 'demand-supply',
    level: 1,
    emoji: '🛒',
    title: '수요와 공급',
    blurb: '가격이 바뀌면 사고 팔고 싶은 양은 어떻게 달라질까요?',
    available: true,
    conceptIds: ['demand', 'supply', 'equilibrium-price'],
    principles: [
      '가격이 오르면 사고 싶은 양은 줄고, 팔고 싶은 양은 늘어납니다.',
      '소득이 늘면 수요가 늘어 가격과 거래량이 함께 오를 수 있습니다.',
      '생산비용이 늘면 공급이 줄어 가격은 오르고 거래량은 줄어들 수 있습니다.',
    ],
    steps: [
      {
        id: 'price',
        question: '치킨 가격이 올라가면\n사람들은 치킨을 얼마나 살까요?',
        hint: '슬라이더로 가격을 움직여 그래프가 어떻게 변하는지 보세요.',
        seed: { price: 10000, incomeManwon: 200, costWon: 4000 },
        controls: [PRICE_CONTROL],
        evaluate: (state) =>
          marketView(state, {
            stats: priceStats(state),
            why: whyByPrice(state),
          }),
      },
      {
        id: 'income',
        question: '이번에는 소비자 소득을\n올려봅시다.',
        hint: '소득이 늘면 “사고 싶은 마음”이 어떻게 이동하는지 보세요.',
        seed: { price: 13300, incomeManwon: 200, costWon: 4000 },
        controls: [
          {
            key: 'incomeManwon',
            label: '소비자 월 소득',
            min: 200,
            max: 600,
            step: 10,
            format: (v) => `${v}만 원`,
          },
        ],
        evaluate: (state) => {
          const market = chickenMarket(state)
          const eq = equilibrium(market)
          const baseEq = equilibrium(CHICKEN)
          const shifted = state.incomeManwon > 210
          return marketView(
            { ...state, price: eq.price },
            {
              ghost: shifted,
              showPriceLine: false,
              stats: shifted
                ? [
                    pill('소득이 늘어 구매 능력이 커졌습니다.', 'up'),
                    pill('같은 가격에서도 더 많이 사고 싶어 합니다.', 'up'),
                    pill(`새로운 균형가격 ${krw(eq.price)}`, 'up'),
                    pill(`새로운 균형수량 ${qty(eq.quantity)}만 마리`, 'up'),
                  ]
                : [
                    pill('소득을 올려 수요가 어떻게 이동하는지 보세요.', 'neutral'),
                    pill(`지금 균형가격은 ${krw(baseEq.price)}입니다.`, 'neutral'),
                  ],
              why: shifted
                ? whyBlock({
                    headline: '소득이 늘면 시장 전체가 바빠져요',
                    chain: [
                      '소비자의 소득이 증가했습니다.',
                      '같은 가격에서도 치킨을 더 살 수 있게 됩니다.',
                      '사고 싶은 양이 늘어 그래프가 오른쪽으로 이동합니다.',
                      '판매자가 바로 그만큼 더 내놓지는 못해, 가격이 오릅니다.',
                      '더 높은 가격에서 새로운 균형이 만들어집니다.',
                    ],
                    termNote: '이 현상을 경제학에서는 수요 증가라고 합니다. 곡선 자체가 이동한 것입니다.',
                    principle: '수요 증가 → 균형가격 상승 · 균형수량 증가',
                  })
                : whyBlock({
                    headline: '소득을 조금 더 올려보세요',
                    chain: [
                      '지금은 소득이 거의 그대로입니다.',
                      '슬라이더를 오른쪽으로 밀어 구매 능력이 커지는 상황을 만들어 보세요.',
                      '그때 파란 선이 어떻게 이동하는지 관찰하면 됩니다.',
                    ],
                    termNote: '가격만 바꿀 때는 곡선 위의 점이 움직이고, 소득이 바뀌면 곡선 자체가 움직입니다.',
                    principle: '소득 변화는 수요곡선을 이동시킬 수 있습니다.',
                  }),
            },
          )
        },
      },
      {
        id: 'cost',
        question: '이번에는 생산비용을\n올려봅시다.',
        hint: '재료비·인건비가 오르면 가게는 같은 가격에 얼마나 팔고 싶어 할까요?',
        seed: { price: 13300, incomeManwon: 200, costWon: 4000 },
        controls: [
          {
            key: 'costWon',
            label: '치킨 한 마리 생산비용',
            min: 4000,
            max: 10000,
            step: 100,
            format: (v) => krw(v),
          },
        ],
        evaluate: (state) => {
          const market = chickenMarket(state)
          const eq = equilibrium(market)
          const shifted = state.costWon > 4200
          return marketView(
            { ...state, price: eq.price },
            {
              ghost: shifted,
              showPriceLine: false,
              stats: shifted
                ? [
                    pill('생산비용이 늘어 가게의 부담이 커졌습니다.', 'down'),
                    pill('같은 가격에서 내놓고 싶은 양이 줄었습니다.', 'down'),
                    pill(`새로운 균형가격 ${krw(eq.price)}`, 'up'),
                    pill(`새로운 균형수량 ${qty(eq.quantity)}만 마리`, 'down'),
                  ]
                : [
                    pill('생산비용을 올려 공급이 어떻게 이동하는지 보세요.', 'neutral'),
                  ],
              why: shifted
                ? whyBlock({
                    headline: '만들기 힘들어지면 시장에 물건이 줄어요',
                    chain: [
                      '생산비용이 증가했습니다.',
                      '기업의 생산 부담이 커집니다.',
                      '같은 가격에서 공급하려는 양이 줄어듭니다.',
                      '공급곡선이 왼쪽으로 이동합니다.',
                      '시장에 나오는 치킨이 줄어 가격이 오릅니다.',
                      '높아진 가격 때문에 거래량도 줄어듭니다.',
                    ],
                    termNote: '이 현상을 경제학에서는 공급 감소라고 합니다.',
                    principle: '공급 감소 → 가격 상승 → 거래량 감소',
                  })
                : whyBlock({
                    headline: '생산비용을 올려보세요',
                    chain: [
                      '지금은 생산비용이 거의 그대로입니다.',
                      '비용을 올리면 주황 선이 왼쪽으로 이동하는지 확인해 보세요.',
                    ],
                    termNote: '공급 감소는 “더 비싸게 받아야 같은 양을 팔겠다”는 마음입니다.',
                    principle: '생산비용 증가는 공급을 줄일 수 있습니다.',
                  }),
            },
          )
        },
      },
    ],
  },
  {
    id: 'equilibrium',
    level: 1,
    emoji: '⚖️',
    title: '균형가격과 균형수량',
    blurb: '사려는 마음과 팔려는 마음이 만나는 지점을 직접 찾아보세요.',
    available: true,
    conceptIds: ['equilibrium-price', 'equilibrium-qty'],
    principles: [
      '균형가격은 사고 싶은 양과 팔고 싶은 양이 같아지는 가격입니다.',
      '그 가격에서 거래되는 양이 균형수량입니다.',
    ],
    steps: [
      {
        id: 'find',
        question: '사려는 양과 팔려는 양이\n같아지는 가격을 찾아볼까요?',
        hint: '두 숫자가 가까워질수록 균형에 가까워집니다.',
        seed: { price: 9000 },
        controls: [PRICE_CONTROL],
        evaluate: (state) => {
          const market = chickenMarket(state)
          const eq = equilibrium(market)
          const snapshot = gap(market, state.price)
          const found = near(state.price, eq.price, 400)
          return marketView(state, {
            stats: found
              ? [
                  pill('균형을 찾았어요!', 'up'),
                  pill(`균형가격 약 ${krw(eq.price)}`, 'neutral'),
                  pill(`균형수량 약 ${qty(eq.quantity)}만 마리`, 'neutral'),
                ]
              : [
                  pill(`사고 싶은 양 ${qty(snapshot.qd)}만 마리`, 'up'),
                  pill(`팔고 싶은 양 ${qty(snapshot.qs)}만 마리`, snapshot.qs > snapshot.qd ? 'down' : 'down'),
                  pill(
                    snapshot.excessDemand > 0
                      ? `아직 ${qty(snapshot.excessDemand)}만 마리 부족`
                      : `아직 ${qty(snapshot.excessSupply)}만 마리 남음`,
                    'warn',
                  ),
                ],
            why: found
              ? whyBlock({
                  headline: '두 마음이 만나는 지점이 균형이에요',
                  chain: [
                    '가격을 조절해 사려는 양과 팔려는 양을 맞춰 보았습니다.',
                    '이 지점에서는 더 올리거나 내릴 힘이 작아집니다.',
                    '너무 비싸면 물건이 남고, 너무 싸면 물건이 모자랍니다.',
                    '그래서 시장은 이 균형 근처로 되돌아오려는 경향이 있습니다.',
                  ],
                  termNote: '균형가격과 균형수량은 “정답 숫자”가 아니라, 두 힘이 맞서는 지점입니다.',
                  principle: '균형은 수요량과 공급량이 만나는 가격과 수량입니다.',
                })
              : whyBlock({
                  headline: '두 숫자를 같게 만들어 보세요',
                  chain: [
                    '지금 사고 싶은 양과 팔고 싶은 양이 다릅니다.',
                    '가격을 올리면 사고 싶은 양은 줄고 팔고 싶은 양은 늘어납니다.',
                    '가격을 내리면 반대가 됩니다.',
                    '두 양이 만나는 곳이 균형입니다.',
                  ],
                  termNote: '그래프의 두 선이 교차하는 점이 바로 균형점입니다.',
                  principle: '가격을 바꾸면 수요량과 공급량이 서로 다른 방향으로 움직입니다.',
                }),
          })
        },
      },
    ],
  },
  {
    id: 'price-demand',
    level: 1,
    emoji: '📉',
    title: '가격 변화와 수요량',
    blurb: '가격만 바꿀 때, 사고 싶은 양은 어떻게 움직일까요?',
    available: true,
    conceptIds: ['demand', 'quantity-demanded'],
    principles: ['다른 조건이 같다면, 가격이 오를수록 사고 싶은 양은 줄어듭니다.'],
    steps: [
      {
        id: 'only-demand',
        question: '가격이 오를 때\n사고 싶은 양만 집중해서 볼까요?',
        hint: '이번엔 파란 선만 봅니다. 점이 곡선을 따라 미끄러집니다.',
        seed: { price: 11000 },
        controls: [PRICE_CONTROL],
        evaluate: (state) => {
          const market = chickenMarket(state)
          const qd = gap(market, state.price).qd
          const higher = state.price > 12000
          return marketView(state, {
            showSupply: false,
            showEq: false,
            stats: [
              pill(higher ? '가격이 높아졌습니다.' : '가격을 더 올려보세요.', higher ? 'down' : 'neutral'),
              pill(`사고 싶은 양 ${qty(qd)}만 마리`, higher ? 'down' : 'neutral'),
            ],
            why: whyBlock({
              headline: '비싸지면 사람들은 조금 덜 삽니다',
              chain: [
                '지금은 소득이나 취향이 아니라, 가격만 바꾸고 있습니다.',
                '가격이 오르면 같은 돈으로 살 수 있는 양이 줄어듭니다.',
                '그래서 치킨을 사고 싶은 양이 감소합니다.',
                '그래프에서는 파란 선 위의 점이 왼쪽 위로 이동합니다.',
              ],
              termNote: '곡선이 이동한 것이 아니라, 같은 수요곡선 위에서 수요량이 변한 것입니다.',
              principle: '가격 상승 → 수요량 감소',
            }),
          })
        },
      },
    ],
  },
  {
    id: 'price-supply',
    level: 1,
    emoji: '📈',
    title: '가격 변화와 공급량',
    blurb: '가격이 오르면 가게는 더 팔고 싶어질까요?',
    available: true,
    conceptIds: ['supply', 'quantity-supplied'],
    principles: ['다른 조건이 같다면, 가격이 오를수록 팔고 싶은 양은 늘어납니다.'],
    steps: [
      {
        id: 'only-supply',
        question: '가격이 오를 때\n팔고 싶은 양만 집중해서 볼까요?',
        hint: '이번엔 주황 선만 봅니다.',
        seed: { price: 11000 },
        controls: [PRICE_CONTROL],
        evaluate: (state) => {
          const market = chickenMarket(state)
          const qs = gap(market, state.price).qs
          const higher = state.price > 12000
          return marketView(state, {
            showDemand: false,
            showEq: false,
            stats: [
              pill(higher ? '가격이 높아졌습니다.' : '가격을 더 올려보세요.', higher ? 'up' : 'neutral'),
              pill(`팔고 싶은 양 ${qty(qs)}만 마리`, higher ? 'up' : 'neutral'),
            ],
            why: whyBlock({
              headline: '비싸게 팔 수 있으면 더 내놓고 싶어집니다',
              chain: [
                '가게는 치킨을 만드는 데 비용이 듭니다.',
                '판매 가격이 오르면 남는 돈이 커져 더 많이 팔고 싶어집니다.',
                '그래서 공급량이 증가합니다.',
                '그래프에서는 주황 선 위의 점이 오른쪽 위로 이동합니다.',
              ],
              termNote: '공급 증가(곡선 이동)와 공급량 증가(곡선 위 이동)는 다릅니다.',
              principle: '가격 상승 → 공급량 증가',
            }),
          })
        },
      },
    ],
  },
  {
    id: 'excess-demand',
    level: 1,
    emoji: '🔥',
    title: '초과수요',
    blurb: '가격이 너무 낮으면 왜 줄이 길어질까요?',
    available: true,
    conceptIds: ['excess-demand'],
    principles: ['가격이 균형보다 낮으면 사고 싶은 양이 더 많아져 물건이 부족해집니다.'],
    steps: [
      {
        id: 'shortage',
        question: '치킨이 너무 싸면\n왜 줄이 길어질까요?',
        hint: '가격을 낮게 유지해 보고, 부족한 양을 확인해 보세요.',
        seed: { price: 8500 },
        controls: [PRICE_CONTROL],
        evaluate: (state) => {
          const snapshot = gap(chickenMarket(state), state.price)
          const short = snapshot.excessDemand > 2
          return marketView(state, {
            stats: short
              ? [
                  pill('가격이 낮아 사람들이 몰립니다.', 'up'),
                  pill(`부족한 양 ${qty(snapshot.excessDemand)}만 마리`, 'warn'),
                ]
              : [
                  pill('가격을 충분히 낮춰 부족 현상을 만들어 보세요.', 'neutral'),
                ],
            why: whyBlock({
              headline: '싸면 사고 싶은 사람은 늘고, 팔고 싶은 가게는 줄어요',
              chain: [
                '가격이 균형보다 낮게 고정되어 있습니다.',
                '소비자는 더 많이 사려고 합니다.',
                '판매자는 이 가격에 많이 내놓고 싶어 하지 않습니다.',
                '사고 싶은 양 > 팔고 싶은 양이 됩니다.',
                '줄이 생기거나, “품절”이 나타납니다.',
              ],
              termNote: '이 부족분을 초과수요라고 합니다.',
              principle: '낮은 가격 → 초과수요 → 물건 부족',
            }),
          })
        },
      },
    ],
  },
  {
    id: 'excess-supply',
    level: 1,
    emoji: '📦',
    title: '초과공급',
    blurb: '가격이 너무 높으면 왜 재고가 쌓일까요?',
    available: true,
    conceptIds: ['excess-supply'],
    principles: ['가격이 균형보다 높으면 팔고 싶은 양이 더 많아져 재고가 쌓입니다.'],
    steps: [
      {
        id: 'surplus',
        question: '치킨이 너무 비싸면\n왜 재고가 남을까요?',
        hint: '가격을 높게 올려 남은 양을 확인해 보세요.',
        seed: { price: 18000 },
        controls: [PRICE_CONTROL],
        evaluate: (state) => {
          const snapshot = gap(chickenMarket(state), state.price)
          const extra = snapshot.excessSupply > 2
          return marketView(state, {
            stats: extra
              ? [
                  pill('가격이 높아 사는 사람이 줄었습니다.', 'down'),
                  pill(`남은 양 ${qty(snapshot.excessSupply)}만 마리`, 'warn'),
                ]
              : [
                  pill('가격을 충분히 높여 재고가 쌓이는 모습을 보세요.', 'neutral'),
                ],
            why: whyBlock({
              headline: '비싸면 가게는 많이 내놓지만, 손님은 줄어듭니다',
              chain: [
                '가격이 균형보다 높게 유지됩니다.',
                '판매자는 더 많이 팔고 싶어 합니다.',
                '소비자는 구매를 줄입니다.',
                '팔고 싶은 양 > 사고 싶은 양이 됩니다.',
                '팔리지 않은 치킨이 남습니다.',
              ],
              termNote: '이 남은 양을 초과공급이라고 합니다.',
              principle: '높은 가격 → 초과공급 → 재고 증가',
            }),
          })
        },
      },
    ],
  },
  {
    id: 'income',
    level: 2,
    emoji: '💰',
    title: '소득 변화',
    blurb: '지갑이 두둑해지면 시장 가격은 어떻게 될까요?',
    available: true,
    conceptIds: ['demand-increase'],
    principles: ['소득이 늘면 수요가 증가해 균형가격과 균형수량이 함께 오를 수 있습니다.'],
    steps: [
      {
        id: 'income-shift',
        question: '소비자의 소득이 증가하면\n시장에서는 어떤 일이 일어날까요?',
        hint: '파란 선이 통째로 이동하는지 보세요. 점이 선 위를 미끄러지는 것과 다릅니다.',
        seed: { incomeManwon: 200, costWon: 4000 },
        controls: [
          {
            key: 'incomeManwon',
            label: '소비자 월 소득',
            min: 200,
            max: 600,
            step: 10,
            format: (v) => `${v}만 원`,
          },
        ],
        evaluate: (state) => {
          const eq = equilibrium(chickenMarket(state))
          const shifted = state.incomeManwon > 220
          return marketView(
            { ...state, price: eq.price },
            {
              ghost: true,
              showPriceLine: false,
              stats: [
                pill(shifted ? '수요가 오른쪽으로 이동했습니다.' : '소득을 올려 수요 이동을 보세요.', shifted ? 'up' : 'neutral'),
                pill(`균형가격 ${krw(eq.price)}`, shifted ? 'up' : 'neutral'),
                pill(`균형수량 ${qty(eq.quantity)}만 마리`, shifted ? 'up' : 'neutral'),
              ],
              why: whyBlock({
                headline: '소득이 늘면 사고 싶은 마음이 커집니다',
                chain: [
                  '소비자의 소득이 증가하면 구매 능력이 커집니다.',
                  '상품에 대한 수요가 증가합니다.',
                  '수요곡선이 오른쪽으로 이동합니다.',
                  '새로운 균형이 형성됩니다.',
                  '균형가격이 상승하고 균형수량도 증가합니다.',
                ],
                termNote: '이 현상을 경제학에서는 수요 증가라고 합니다.',
                principle: '수요 증가 → 가격 상승 · 거래량 증가',
              }),
            },
          )
        },
      },
    ],
  },
  {
    id: 'cost',
    level: 2,
    emoji: '🏭',
    title: '생산비용 변화',
    blurb: '재료비가 오르면 왜 판매 가격도 따라 오를까요?',
    available: true,
    conceptIds: ['supply-decrease'],
    principles: ['생산비용이 늘면 공급이 감소해 가격은 오르고 거래량은 줄어들 수 있습니다.'],
    steps: [
      {
        id: 'cost-shift',
        question: '재료비가 오르면\n가게는 같은 가격에 얼마나 팔까요?',
        hint: '주황 선이 왼쪽으로 이동하는지 관찰해 보세요.',
        seed: { incomeManwon: 200, costWon: 4000 },
        controls: [
          {
            key: 'costWon',
            label: '생산비용',
            min: 4000,
            max: 10000,
            step: 100,
            format: (v) => krw(v),
          },
        ],
        evaluate: (state) => {
          const eq = equilibrium(chickenMarket(state))
          const shifted = state.costWon > 4300
          return marketView(
            { ...state, price: eq.price },
            {
              ghost: true,
              showPriceLine: false,
              stats: [
                pill(shifted ? '공급이 왼쪽으로 이동했습니다.' : '생산비용을 올려보세요.', shifted ? 'down' : 'neutral'),
                pill(`균형가격 ${krw(eq.price)}`, shifted ? 'up' : 'neutral'),
                pill(`균형수량 ${qty(eq.quantity)}만 마리`, shifted ? 'down' : 'neutral'),
              ],
              why: whyBlock({
                headline: '만들기 비싸지면 공급이 줄어듭니다',
                chain: [
                  '생산비용이 증가합니다.',
                  '기업의 생산 부담이 커집니다.',
                  '같은 가격에서 공급하려는 양이 감소합니다.',
                  '공급곡선이 왼쪽으로 이동합니다.',
                  '가격은 상승하고 거래량은 감소합니다.',
                ],
                termNote: '이 현상을 경제학에서는 공급 감소라고 합니다.',
                principle: '공급 감소 → 가격 상승 → 거래량 감소',
              }),
            },
          )
        },
      },
    ],
  },
  {
    id: 'tax',
    level: 2,
    emoji: '🧾',
    title: '세금',
    blurb: '판매에 세금을 붙이면 가격과 거래량은 어떻게 될까요?',
    available: true,
    conceptIds: ['tax'],
    principles: ['판매세는 공급을 줄여 소비자 가격을 올리고 거래량을 줄일 수 있습니다.'],
    steps: [
      {
        id: 'tax-shift',
        question: '치킨 한 마리마다 세금을 붙이면\n시장은 어떻게 바뀔까요?',
        hint: '세금은 가게가 느끼는 비용을 키우는 것과 비슷합니다.',
        seed: { tax: 0, subsidy: 0, incomeManwon: 200, costWon: 4000 },
        controls: [
          {
            key: 'tax',
            label: '마리당 세금',
            min: 0,
            max: 4000,
            step: 100,
            format: (v) => krw(v),
          },
        ],
        evaluate: (state) => {
          const eq = equilibrium(chickenMarket(state))
          const taxed = state.tax > 100
          return marketView(
            { ...state, price: eq.price },
            {
              ghost: true,
              showPriceLine: false,
              stats: [
                pill(taxed ? '세금이 공급을 밀어 올렸습니다.' : '세금을 올려보세요.', taxed ? 'down' : 'neutral'),
                pill(`소비자 가격 ${krw(eq.price)}`, taxed ? 'down' : 'neutral'),
                pill(`거래량 ${qty(eq.quantity)}만 마리`, taxed ? 'down' : 'neutral'),
              ],
              why: whyBlock({
                headline: '세금은 생산 부담을 키웁니다',
                chain: [
                  '정부가 판매에 세금을 붙입니다.',
                  '가게 입장에서는 생산비용이 늘어난 것과 비슷합니다.',
                  '같은 가격에서 팔고 싶은 양이 줄어 공급이 왼쪽으로 이동합니다.',
                  '소비자가 내는 가격은 오르고, 거래량은 줄어듭니다.',
                ],
                termNote: '실제로는 세금의 일부를 소비자와 생산자가 나눠 냅니다. 이것을 조세 부담의 귀착이라고 합니다.',
                principle: '세금 → 공급 감소 → 가격 상승 · 거래량 감소',
              }),
            },
          )
        },
      },
    ],
  },
  {
    id: 'subsidy',
    level: 2,
    emoji: '🎁',
    title: '보조금',
    blurb: '정부가 생산을 도와주면 가격은 내려갈까요?',
    available: true,
    conceptIds: ['subsidy'],
    principles: ['보조금은 공급을 늘려 가격을 낮추고 거래량을 늘릴 수 있습니다.'],
    steps: [
      {
        id: 'subsidy-shift',
        question: '정부가 치킨 생산을 도와주면\n시장 가격은 어떻게 될까요?',
        hint: '보조금은 생산비용을 줄여 주는 것과 비슷합니다.',
        seed: { subsidy: 0, tax: 0, incomeManwon: 200, costWon: 4000 },
        controls: [
          {
            key: 'subsidy',
            label: '마리당 보조금',
            min: 0,
            max: 4000,
            step: 100,
            format: (v) => krw(v),
          },
        ],
        evaluate: (state) => {
          const eq = equilibrium(chickenMarket(state))
          const helped = state.subsidy > 100
          return marketView(
            { ...state, price: eq.price },
            {
              ghost: true,
              showPriceLine: false,
              stats: [
                pill(helped ? '보조금이 공급을 늘렸습니다.' : '보조금을 올려보세요.', helped ? 'up' : 'neutral'),
                pill(`소비자 가격 ${krw(eq.price)}`, helped ? 'up' : 'neutral'),
                pill(`거래량 ${qty(eq.quantity)}만 마리`, helped ? 'up' : 'neutral'),
              ],
              why: whyBlock({
                headline: '보조금은 공급을 북돋웁니다',
                chain: [
                  '정부가 생산자에게 보조금을 줍니다.',
                  '가게의 실질 부담이 줄어듭니다.',
                  '같은 가격에서 더 많이 팔고 싶어져 공급이 오른쪽으로 이동합니다.',
                  '소비자 가격은 내려가고 거래량은 늘어날 수 있습니다.',
                ],
                termNote: '보조금의 효과도 수요와 공급의 탄력성에 따라 누가 더 혜택을 보는지가 달라집니다.',
                principle: '보조금 → 공급 증가 → 가격 하락 · 거래량 증가',
              }),
            },
          )
        },
      },
    ],
  },
  {
    id: 'price-ceiling',
    level: 2,
    emoji: '⬇️',
    title: '가격상한제',
    blurb: '가격을 낮게 묶으면 정말 모두가 행복해질까요?',
    available: true,
    conceptIds: ['price-ceiling'],
    principles: ['균형보다 낮은 가격상한은 초과수요(부족)를 만들 수 있습니다.'],
    steps: [
      {
        id: 'ceiling',
        question: '정부가 치킨 가격을\n낮게 묶어버리면 어떻게 될까요?',
        hint: '상한을 균형보다 아래로 내려 부족한 양을 확인해 보세요.',
        seed: { ceiling: 15000, incomeManwon: 200, costWon: 4000 },
        controls: [
          {
            key: 'ceiling',
            label: '가격 상한',
            min: 7000,
            max: 18000,
            step: 100,
            format: (v) => krw(v),
          },
        ],
        evaluate: (state) => {
          const market = chickenMarket(state)
          const eq = equilibrium(market)
          const result = ceilingOutcome(market, state.ceiling)
          return marketView(
            { ...state, price: result.price },
            {
              ceiling: state.ceiling,
              showPriceLine: true,
              stats: result.binding
                ? [
                    pill(`가격이 ${krw(state.ceiling)}로 묶였습니다.`, 'up'),
                    pill(`사고 싶은 양 ${qty(result.qd)}만 마리`, 'up'),
                    pill(`팔고 싶은 양 ${qty(result.qs)}만 마리`, 'down'),
                    pill(`부족한 양 ${qty(result.shortage)}만 마리`, 'warn'),
                  ]
                : [
                    pill(`시장 균형가격은 ${krw(eq.price)}입니다.`, 'neutral'),
                    pill('상한이 균형보다 높아 거의 영향을 주지 않습니다.', 'neutral'),
                  ],
              why: result.binding
                ? whyBlock({
                    headline: '싸게 사게 해주면, 물건이 모자랄 수 있어요',
                    chain: [
                      `시장 균형가격은 약 ${krw(eq.price)}입니다.`,
                      `정부는 가격상한을 ${krw(state.ceiling)}로 정했습니다.`,
                      '낮아진 가격에 소비자는 더 사고 싶어 합니다.',
                      '생산자는 그 가격에 덜 팔고 싶어 합니다.',
                      '사고 싶은 양 > 팔고 싶은 양이 되어 초과수요가 발생합니다.',
                    ],
                    termNote: '가격상한제는 최고가격을 정해 그 이상으로 팔지 못하게 하는 정책입니다.',
                    principle: '가격상한(균형보다 낮음) → 초과수요 → 부족',
                  })
                : whyBlock({
                    headline: '상한이 너무 높으면 아무 일도 안 일어나요',
                    chain: [
                      '가격상한이 균형가격보다 높으면, 시장은 원래 균형에서 거래합니다.',
                      '상한을 균형보다 아래로 내려야 효과가 나타납니다.',
                      '집세 상한, 생필품 최고가격처럼 “너무 비싸지지 않게” 하려는 정책이 이 모양입니다.',
                    ],
                    termNote: '효과가 있는 가격상한을 경제학에서는 拘束的(구속적) 가격상한이라고 합니다.',
                    principle: '균형보다 높은 상한은 시장을 바꾸지 않습니다.',
                  }),
            },
          )
        },
      },
    ],
  },
  {
    id: 'price-floor',
    level: 2,
    emoji: '⬆️',
    title: '가격하한제',
    blurb: '가격을 높게 받쳐주면 왜 물건이 남을까요?',
    available: true,
    conceptIds: ['price-floor'],
    principles: ['균형보다 높은 가격하한은 초과공급(재고)을 만들 수 있습니다.'],
    steps: [
      {
        id: 'floor',
        question: '정부가 최저 가격을\n높게 정해버리면 어떻게 될까요?',
        hint: '하한을 균형보다 위로 올려 남는 양을 확인해 보세요.',
        seed: { floor: 10000, incomeManwon: 200, costWon: 4000 },
        controls: [
          {
            key: 'floor',
            label: '가격 하한',
            min: 8000,
            max: 22000,
            step: 100,
            format: (v) => krw(v),
          },
        ],
        evaluate: (state) => {
          const market = chickenMarket(state)
          const eq = equilibrium(market)
          const result = floorOutcome(market, state.floor)
          return marketView(
            { ...state, price: result.price },
            {
              floor: state.floor,
              showPriceLine: true,
              stats: result.binding
                ? [
                    pill(`가격이 ${krw(state.floor)} 아래로 내려가지 않습니다.`, 'down'),
                    pill(`사고 싶은 양 ${qty(result.qd)}만 마리`, 'down'),
                    pill(`팔고 싶은 양 ${qty(result.qs)}만 마리`, 'up'),
                    pill(`남는 양 ${qty(result.surplus)}만 마리`, 'warn'),
                  ]
                : [
                    pill(`시장 균형가격은 ${krw(eq.price)}입니다.`, 'neutral'),
                    pill('하한이 균형보다 낮아 거의 영향을 주지 않습니다.', 'neutral'),
                  ],
              why: result.binding
                ? whyBlock({
                    headline: '비싸게 받쳐주면 재고가 쌓일 수 있어요',
                    chain: [
                      `시장 균형가격은 약 ${krw(eq.price)}입니다.`,
                      `정부는 가격하한을 ${krw(state.floor)}로 정했습니다.`,
                      '높아진 가격에 소비자는 덜 삽니다.',
                      '생산자는 더 많이 팔고 싶어 합니다.',
                      '팔고 싶은 양 > 사고 싶은 양이 되어 초과공급이 발생합니다.',
                    ],
                    termNote: '농산물 최저가격, 최저임금(노동시장)이 가격하한의 대표 사례입니다.',
                    principle: '가격하한(균형보다 높음) → 초과공급 → 재고',
                  })
                : whyBlock({
                    headline: '하한이 너무 낮으면 시장은 그대로예요',
                    chain: [
                      '가격하한이 균형보다 낮으면 시장은 원래 균형에서 거래합니다.',
                      '하한을 균형보다 위로 올려야 “받쳐주는” 효과가 나타납니다.',
                    ],
                    termNote: '효과가 있는 하한을 구속적 가격하한이라고 합니다.',
                    principle: '균형보다 낮은 하한은 시장을 바꾸지 않습니다.',
                  }),
            },
          )
        },
      },
    ],
  },
  {
    id: 'elasticity',
    level: 2,
    emoji: '🎯',
    title: '탄력성',
    blurb: '가격이 오를 때, 어떤 물건은 왜 덜 줄고 어떤 물건은 확 줄까요?',
    available: true,
    conceptIds: ['elasticity'],
    principles: [
      '비탄력적인 재화는 가격이 올라도 수요량이 덜 줄어 총수입이 늘 수 있습니다.',
      '탄력적인 재화는 가격이 오르면 수요량이 크게 줄어 총수입이 감소할 수 있습니다.',
    ],
    steps: [
      {
        id: 'ramen',
        question: '라면 가격이 오르면\n사람들은 얼마나 덜 살까요?',
        hint: '생필품은 가격이 올라도 쉽게 포기하기 어렵습니다.',
        seed: { goodId: 'ramen', price: 10000 },
        controls: [
          {
            key: 'price',
            label: '라면 가격',
            min: 8000,
            max: 15000,
            step: 100,
            format: (v) => krw(v),
          },
        ],
        evaluate: (state) => evaluateElasticity(state, 'ramen'),
      },
      {
        id: 'dessert',
        question: '특별한 디저트 가격이 오르면\n총수입은 어떻게 될까요?',
        hint: '없어도 되는 물건은 가격에 더 민감합니다.',
        seed: { goodId: 'dessert', price: 10000 },
        controls: [
          {
            key: 'price',
            label: '디저트 가격',
            min: 8000,
            max: 15000,
            step: 100,
            format: (v) => krw(v),
          },
        ],
        evaluate: (state) => evaluateElasticity(state, 'dessert'),
      },
    ],
  },
  {
    id: 'interest',
    level: 3,
    emoji: '🏦',
    title: '금리',
    blurb: '금리가 오르면 소비, 저축, 투자는 어떤 방향으로 움직일까요?',
    available: true,
    nextLabId: 'money',
    conceptIds: ['interest'],
    principles: ['금리가 오르면 대출 부담이 커져 소비와 투자가 줄고, 저축의 매력은 커질 수 있습니다.'],
    steps: [
      {
        id: 'rate',
        question: '금리가 오르면\n어떤 일이 일어날까요?',
        hint: '직접 움직여보세요. 기준금리를 올리면 대출·소비·투자가 바로 변합니다.',
        seed: { rate: 3.5 },
        controls: [
          {
            key: 'rate',
            label: '기준금리',
            min: 1.5,
            max: 7,
            step: 0.25,
            format: (v) => `${v.toFixed(2)}%`,
          },
        ],
        evaluate: (state) => {
          const scene = interestScene(state.rate)
          const up = state.rate > 3.6
          const down = state.rate < 3.4
          return {
            kind: 'bars',
            bars: scene.bars,
            stats: [
              pill(up ? '금리가 높아졌습니다.' : down ? '금리가 낮아졌습니다.' : '금리를 위아래로 움직여 보세요.', up ? 'down' : down ? 'up' : 'neutral'),
              pill(up ? '대출 부담이 커집니다.' : '이자 부담의 변화를 관찰하세요.', up ? 'down' : 'neutral'),
              pill(up ? '소비와 투자가 위축될 수 있습니다.' : down ? '소비와 투자가 살아날 수 있습니다.' : '방향을 확인해 보세요.', up ? 'down' : down ? 'up' : 'neutral'),
            ],
            why: whyBlock({
              headline: up ? '돈 빌리기가 비싸지면 지출이 줄어듭니다' : '금리는 돈의 사용료예요',
              chain: up
                ? [
                    '금리가 상승했습니다.',
                    '이미 대출이 있거나 새로 돈을 빌리려는 사람의 이자 부담이 커집니다.',
                    '가계는 소비를 줄이고, 기업은 투자를 미룰 수 있습니다.',
                    '반대로 예금 이자가 높아져 저축의 매력은 커집니다.',
                    '경제 전체의 활동이 차분해질 수 있습니다.',
                  ]
                : [
                    '금리는 돈을 빌릴 때 내는 사용료이자, 돈을 빌려줄 때 받는 보상입니다.',
                    '금리를 올리면 빌리기는 어려워지고 저축은 매력적이 됩니다.',
                    '금리를 내리면 반대 방향으로 움직입니다.',
                    '실제 경제는 기대, 부동산, 환율도 함께 움직이지만, 가장 기본 줄기는 이것입니다.',
                  ],
              termNote: up
                ? '이 현상을 경제학에서는 통화정책의 긴축, 또는 금리 인상 효과라고 합니다. 중앙은행이 정책금리를 조절해 경기에 영향을 주는 것이 통화정책입니다.'
                : '중앙은행이 정책금리를 조절해 경기에 영향을 주는 것을 통화정책이라고 합니다. 금리를 내리는 방향은 완화라고 부르기도 합니다.',
              principle: '금리 상승 → 대출 부담 증가 → 소비·투자 감소',
            }),
          }
        },
      },
    ],
  },
  {
    id: 'inflation',
    level: 3,
    emoji: '📈',
    title: '인플레이션',
    blurb: '사람들이 한꺼번에 더 사려고 하면 물가는 왜 오를까요?',
    available: true,
    nextLabId: 'gdp',
    conceptIds: ['inflation'],
    principles: ['많은 사람이 동시에 더 사려고 하면 물건 가격 수준이 오르고, 같은 돈의 가치는 줄어들 수 있습니다.'],
    steps: [
      {
        id: 'heat',
        question: '물가는 왜 상승할까요?',
        hint: '직접 움직여보세요. 사려는 열기를 키우면 물가와 돈의 가치가 변합니다.',
        seed: { heat: 25 },
        controls: [
          {
            key: 'heat',
            label: '사려는 열기',
            min: 0,
            max: 100,
            step: 1,
            format: (v) => `${v}`,
          },
        ],
        evaluate: (state) => {
          const scene = inflationScene(state.heat)
          const hot = state.heat > 40
          return {
            kind: 'bars',
            bars: scene.bars,
            stats: [
              pill(hot ? '사려는 사람이 한꺼번에 늘었습니다.' : '열기를 높여 물가 변화를 보세요.', hot ? 'down' : 'neutral'),
              pill(`물가 지수 ${Math.round(scene.priceIndex)}`, hot ? 'down' : 'neutral'),
              pill(hot ? '같은 돈으로 살 수 있는 양이 줄었습니다.' : '돈의 구매력을 함께 보세요.', hot ? 'down' : 'neutral'),
            ],
            why: whyBlock({
              headline: '모두가 지금 사려고 하면 가격이 올라갑니다',
              chain: [
                '많은 사람이 동시에 물건을 더 사려고 합니다.',
                '가게가 바로 그만큼 더 만들지는 못합니다.',
                '사고 싶은 마음이 공급보다 커지면 가격 수준이 올라갑니다.',
                '가격이 오르면 같은 돈으로 살 수 있는 양이 줄어듭니다.',
              ],
              termNote: '물가가 지속적으로 오르는 현상을 인플레이션이라고 합니다. 수요가 끌어올리는 경우를 수요견인 인플레이션이라고 합니다.',
              principle: '수요 급증 → 물가 상승 → 화폐 구매력 하락',
            }),
          }
        },
      },
    ],
  },
  {
    id: 'exchange',
    level: 4,
    emoji: '🌎',
    title: '환율',
    blurb: '달러를 사려는 사람이 많아지면 원/달러는 어떻게 될까요?',
    available: true,
    nextLabId: 'trade',
    conceptIds: ['exchange'],
    principles: ['달러 수요가 늘면 원/달러 환율이 올라 수입과 여행은 비싸지고, 수출 가격 경쟁력은 커질 수 있습니다.'],
    steps: [
      {
        id: 'dollar',
        question: '달러를 사려는 사람이 많아지면\n원/달러는 어떻게 될까요?',
        hint: '직접 움직여보세요. 달러 수요를 바꾸면 환율과 $100 상품의 원화 가격이 변합니다.',
        seed: { dollarHeat: 30 },
        controls: [
          {
            key: 'dollarHeat',
            label: '달러를 사려는 마음',
            min: 0,
            max: 100,
            step: 1,
            format: (v) => `${v}`,
          },
        ],
        evaluate: (state) => {
          const scene = exchangeScene(state.dollarHeat)
          const itemKrw = scene.fx * 100
          const hot = state.dollarHeat > 45
          const cool = state.dollarHeat < 20
          return {
            kind: 'hero',
            hero: {
              label: '원/달러 환율',
              value: `1달러 = ${Math.round(scene.fx).toLocaleString('ko-KR')}원`,
              sub: `미국 상품 $100 → ${krw(itemKrw)}`,
              tone: hot ? 'down' : cool ? 'up' : '',
              wide: true,
            },
            bars: scene.bars.filter((bar) => bar.key !== 'fx'),
            stats: [
              pill(hot ? '달러 수요가 늘어났습니다.' : cool ? '달러 수요가 줄었습니다.' : '달러 수요를 움직여 환율 변화를 보세요.', hot ? 'down' : cool ? 'up' : 'neutral'),
              pill(hot ? `같은 $100를 사려면 ${krw(itemKrw)}가 필요합니다.` : `미국 상품 $100의 원화 가격은 ${krw(itemKrw)}입니다.`, hot ? 'down' : 'neutral'),
              pill(hot ? '수입과 해외여행이 비싸집니다.' : cool ? '수입과 해외여행이 상대적으로 덜 부담됩니다.' : '수입 물가와 여행 비용을 함께 보세요.', hot ? 'down' : cool ? 'up' : 'neutral'),
            ],
            why: whyBlock({
              headline: hot ? '달러가 많이 필요해지면 달러 값이 오릅니다' : '달러 수요가 환율을 움직입니다',
              chain: hot
                ? [
                    '달러를 사려는 사람이 많아졌습니다.',
                    '달러 가치가 상승합니다.',
                    '원/달러 환율이 올라갑니다.',
                    '같은 1달러를 사기 위해 더 많은 원화가 필요합니다.',
                    `미국 상품 100달러는 지금 약 ${krw(itemKrw)}입니다.`,
                  ]
                : [
                    '해외여행이나 수입 물건을 사려면 달러가 필요합니다.',
                    '달러를 사려는 사람이 많아지면 외환시장에서 달러 수요가 증가합니다.',
                    '원으로 표시한 달러 가격, 즉 원/달러 환율이 상승합니다.',
                    '수입품과 해외여행은 비싸지고, 우리 수출품은 외국에서 상대적으로 싸 보일 수 있습니다.',
                  ],
              termNote: '환율 상승은 “원화 가치 하락, 달러 가치 상승”과 같은 방향입니다.',
              principle: '달러 수요 증가 → 환율 상승 → 같은 달러를 사는 데 더 많은 원화 필요',
            }),
          }
        },
      },
    ],
  },
  ...LEVEL34_LABS,
]

function evaluateElasticity(state, goodId) {
  const good = GOODS[goodId]
  const basePrice = 10000
  const price = state.price
  const q0 = quantityAt(good, basePrice)
  const q1 = quantityAt(good, price)
  const tr0 = totalRevenue(basePrice, q0)
  const tr1 = totalRevenue(price, q1)
  const ed = pointElasticity(good, price)
  const kind = classifyElasticity(ed)
  const moved = Math.abs(price - basePrice) >= 200
  const dP = percentChange(basePrice, price)
  const dQ = percentChange(q0, q1)
  const dTR = percentChange(tr0, tr1)

  return {
    kind: 'elasticity',
    good,
    price,
    quantity: q1,
    elasticity: ed,
    classKind: kind,
    classLabel: elasticityLabel(kind),
    tr: tr1,
    compare: moved
      ? {
          dP,
          dQ,
          dTR,
          tr0,
          tr1,
        }
      : null,
    stats: moved
      ? [
          pill(`가격 ${pct(dP, 1)}`, dP > 0 ? 'down' : 'up'),
          pill(`수요량 ${pct(dQ, 1)}`, dQ < 0 ? 'down' : 'up'),
          pill(`총수입 ${pct(dTR, 1)}`, dTR > 0 ? 'up' : 'down'),
          pill(`지금은 ${elasticityLabel(kind)}`, 'neutral'),
        ]
      : [
          pill('가격을 기준(10,000원)에서 움직여 보세요.', 'neutral'),
          pill(`${good.name}은(는) 가격에 ${goodId === 'ramen' ? '덜' : '더'} 민감합니다.`, 'neutral'),
        ],
    why: whyBlock({
      headline:
        kind === 'inelastic'
          ? '가격이 올라도 쉽게 그만두지 못합니다'
          : kind === 'elastic'
            ? '가격이 오르면 많이 줄어듭니다'
            : '가격과 수요량이 비슷한 비율로 움직입니다',
      chain: [
        `가격이 ${pct(moved ? dP : 10, 1)} 변하면, 사고 싶은 양은 약 ${pct(moved ? dQ : goodId === 'ramen' ? -3.3 : -20, 1)} 변합니다.`,
        kind === 'inelastic'
          ? '라면처럼 일상에서 꼭 찾는 물건은 비싸져도 바로 포기하기 어렵습니다.'
          : '특별한 디저트처럼 “없어도 되는” 물건은 조금만 비싸져도 구매가 크게 줄어듭니다.',
        '수요량이 변하면 가게의 총수입(가격 × 판매량)도 함께 변합니다.',
        kind === 'inelastic'
          ? '비탄력적이면 가격이 오를 때 판매량은 조금 줄지만, 총수입은 늘어날 수 있습니다.'
          : '탄력적이면 가격이 오를 때 판매량이 크게 줄어 총수입이 감소할 수 있습니다.',
      ],
      termNote: `가격 변화율에 대한 수요량 변화율의 크기를 수요의 가격탄력성이라고 합니다. 지금 값은 약 ${Number.isFinite(ed) ? ed.toFixed(2) : '∞'}입니다.`,
      principle: '가격 변화 → 수요량 변화 → 총수입 변화',
    }),
  }
}

export const LEVEL_META = [
  {
    level: 1,
    code: 'LEVEL 01',
    title: '경제 기초',
    subtitle: '가격이 바뀌면 마음도 바뀝니다',
  },
  {
    level: 2,
    code: 'LEVEL 02',
    title: '시장과 정책',
    subtitle: '조건이 바뀌면 곡선이 이동합니다',
  },
  {
    level: 3,
    code: 'LEVEL 03',
    title: '거시경제',
    subtitle: '나라 전체의 온도와 속도를 봅니다',
  },
  {
    level: 4,
    code: 'LEVEL 04',
    title: '국제경제',
    subtitle: '나라와 나라 사이에서 가격이 만납니다',
  },
]

export function getLab(id) {
  return LABS.find((lab) => lab.id === id) ?? null
}

export function labsByLevel(level) {
  return LABS.filter((lab) => lab.level === level)
}

export const HOME_QUESTIONS = [
  { to: '/experiments/demand-supply', emoji: '🛒', title: '가격은 왜 오를까?' },
  { to: '/experiments/interest', emoji: '💰', title: '금리가 오르면 어떻게 될까?' },
  { to: '/experiments/inflation', emoji: '📈', title: '물가는 왜 상승할까?' },
  { to: '/experiments/exchange', emoji: '🌎', title: '환율은 왜 변할까?' },
]

export const TODAY_LAB_ID = 'interest'
