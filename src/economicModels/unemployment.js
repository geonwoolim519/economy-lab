import { clamp } from '../lib/format.js'

export function laborMarket(hiring) {
  const h = clamp(hiring, 0, 100)
  const laborForce = 100
  const employed = Math.round(68 + h * 0.24)
  const unemployed = laborForce - employed
  const rate = (unemployed / laborForce) * 100
  return {
    hiring: h,
    laborForce,
    employed,
    unemployed,
    rate,
  }
}
