export function opportunityCost(own, other) {
  if (own <= 0) return Infinity
  return other / own
}

export function comparativeAdvantage({ krChip, krWheat, usChip, usWheat }) {
  const krChipOc = opportunityCost(krChip, krWheat)
  const usChipOc = opportunityCost(usChip, usWheat)
  const krWheatOc = opportunityCost(krWheat, krChip)
  const usWheatOc = opportunityCost(usWheat, usChip)

  const krAbsChip = krChip > usChip
  const krAbsWheat = krWheat > usWheat

  const krChipAdvantage = krChipOc < usChipOc
  const krWheatAdvantage = krWheatOc < usWheatOc

  const autarky = {
    krChip: krChip / 2,
    krWheat: krWheat / 2,
    usChip: usChip / 2,
    usWheat: usWheat / 2,
  }
  const autarkyTotal = {
    chip: autarky.krChip + autarky.usChip,
    wheat: autarky.krWheat + autarky.usWheat,
  }

  const specialized = krChipAdvantage
    ? { krChip, krWheat: 0, usChip: 0, usWheat }
    : { krChip: 0, krWheat, usChip, usWheat: 0 }

  const specializedTotal = {
    chip: specialized.krChip + specialized.usChip,
    wheat: specialized.krWheat + specialized.usWheat,
  }

  return {
    krChipOc,
    usChipOc,
    krWheatOc,
    usWheatOc,
    krAbsChip,
    krAbsWheat,
    krChipAdvantage,
    krWheatAdvantage,
    autarkyTotal,
    specializedTotal,
  }
}
