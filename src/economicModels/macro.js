import { clamp } from '../lib/format.js'

export function interestScene(rate) {
  const r = clamp(rate, 1, 8)
  const loanBurden = 20 + r * 10
  const spending = 100 - r * 9
  const saving = 18 + r * 8
  const investment = 92 - r * 10

  return {
    rate: r,
    bars: [
      {
        key: 'loan',
        label: '대출 이자 부담',
        value: loanBurden,
        display: `${Math.round(loanBurden)}`,
        color: '#E25C5C',
      },
      {
        key: 'spend',
        label: '소비와 투자',
        value: Math.max(8, spending),
        display: `${Math.round(Math.max(8, spending))}`,
        color: '#3157D5',
      },
      {
        key: 'save',
        label: '예금의 매력',
        value: saving,
        display: `${Math.round(saving)}`,
        color: '#1F9D61',
      },
      {
        key: 'invest',
        label: '기업의 투자 의욕',
        value: Math.max(8, investment),
        display: `${Math.round(Math.max(8, investment))}`,
        color: '#E8853A',
      },
    ],
  }
}

export function inflationScene(heat) {
  const h = clamp(heat, 0, 100)
  const priceIndex = 100 + h * 0.7
  const purchasing = 100 - h * 0.45
  const waiting = Math.max(8, 70 - h * 0.4)

  return {
    heat: h,
    priceIndex,
    bars: [
      {
        key: 'price',
        label: '물건 가격 수준',
        value: Math.min(100, (priceIndex - 100) * 1.1 + 20),
        display: `${Math.round(priceIndex)}`,
        color: '#E25C5C',
      },
      {
        key: 'buy',
        label: '같은 돈으로 살 수 있는 양',
        value: Math.max(12, purchasing),
        display: `${Math.round(purchasing)}`,
        color: '#3157D5',
      },
      {
        key: 'wait',
        label: '가격이 내리기를 기다리는 마음',
        value: waiting,
        display: `${Math.round(waiting)}`,
        color: '#667085',
      },
    ],
  }
}

export function exchangeScene(dollarHeat) {
  const h = clamp(dollarHeat, 0, 100)
  const fx = 1100 + h * 6.5
  const importPrice = 40 + h * 0.5
  const tripCost = 30 + h * 0.55
  const exportBoost = 20 + h * 0.35

  return {
    fx,
    bars: [
      {
        key: 'fx',
        label: '원/달러 환율',
        value: ((fx - 1100) / 650) * 100,
        display: `${Math.round(fx).toLocaleString('ko-KR')}원`,
        color: '#3157D5',
      },
      {
        key: 'import',
        label: '수입 물건의 부담',
        value: importPrice,
        display: `${Math.round(importPrice)}`,
        color: '#E25C5C',
      },
      {
        key: 'trip',
        label: '해외여행 비용',
        value: tripCost,
        display: `${Math.round(tripCost)}`,
        color: '#E8853A',
      },
      {
        key: 'export',
        label: '수출 상품의 가격 경쟁력',
        value: exportBoost,
        display: `${Math.round(exportBoost)}`,
        color: '#1F9D61',
      },
    ],
  }
}
