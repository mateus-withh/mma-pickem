const CURRENCY_ABBREVIATION = 'UFC P'

/**
 * O sistema trabalha internamente com precisão total. O arredondamento
 * para duas casas decimais acontece APENAS na exibição.
 */
export function roundToDisplay(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function formatUfcPoints(value: number, options?: { showSign?: boolean }): string {
  const rounded = roundToDisplay(value)
  const sign = options?.showSign && rounded > 0 ? '+' : ''
  const formatted = rounded.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${sign}${formatted} ${CURRENCY_ABBREVIATION}`
}

export function formatPercent(value: number): string {
  const rounded = roundToDisplay(value)
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

/** Percentual "puro", sem sinal de +/- — para taxas (ex: taxa de acerto), não para variações como ROI. */
export function formatPlainPercent(value: number): string {
  const rounded = roundToDisplay(value)
  return `${rounded.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}
