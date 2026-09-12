import { tariffScene } from './tariff.js'

export function ftaCompare(currentTariff) {
  return {
    before: tariffScene(10),
    after: tariffScene(currentTariff),
  }
}
