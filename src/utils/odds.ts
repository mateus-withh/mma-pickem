/**
 * Odds americanas.
 *
 * Positiva (ex: +200): representa o lucro gerado por uma aposta de 100.
 *   lucro = valorApostado × (odd / 100)
 *
 * Negativa (ex: -200): representa quanto é necessário apostar para
 * lucrar 100.
 *   lucro = valorApostado × (100 / |odd|)
 *
 * O sistema trabalha com precisão total internamente; o arredondamento
 * para duas casas decimais acontece apenas na exibição (ver utils/currency.ts).
 */

export function isValidAmericanOdd(odd: number): boolean {
  return Number.isFinite(odd) && odd !== 0
}

export function calculateProfit(stake: number, odd: number): number {
  if (!isValidAmericanOdd(odd)) {
    throw new Error('Odd inválida: deve ser um número diferente de zero.')
  }
  if (!(stake > 0)) {
    throw new Error('O valor apostado deve ser maior que zero.')
  }

  return odd > 0 ? stake * (odd / 100) : stake * (100 / Math.abs(odd))
}

export function calculatePayout(stake: number, odd: number): number {
  return stake + calculateProfit(stake, odd)
}

/** Formata a odd com o sinal explícito de "+" quando positiva (ex: +150, -200). */
export function formatAmericanOdd(odd: number): string {
  return odd > 0 ? `+${odd}` : `${odd}`
}
