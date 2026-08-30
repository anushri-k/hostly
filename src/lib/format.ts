/** $1,234.50 — always two decimals. */
export function money(n: number) {
  return (
    '$' +
    n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

/** $1,234 — no decimals, for headline figures. */
export function money0(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

/** 0.18 -> "18%" */
export function percent(fraction: number, digits = 0) {
  return (fraction * 100).toFixed(digits) + '%'
}
