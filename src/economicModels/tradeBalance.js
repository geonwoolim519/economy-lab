export function tradeBalance(exportsValue, importsValue) {
  const balance = exportsValue - importsValue
  let status = 'balanced'
  if (balance > 2) status = 'surplus'
  if (balance < -2) status = 'deficit'
  return {
    exportsValue,
    importsValue,
    balance,
    status,
  }
}

export function statusLabel(status) {
  if (status === 'surplus') return '무역흑자'
  if (status === 'deficit') return '무역적자'
  return '무역균형'
}
