import type { Bet } from '@/types/bet'
import type { WalletSummary } from '@/types/wallet'

export interface ProfileStatistics {
  totalBets: number
  wins: number
  losses: number
  voided: number
  pending: number
  /** Percentual de acerto sobre decisões (vitórias + derrotas — anuladas/pendentes não contam). */
  winRate: number
  totalWagered: number
  totalReturned: number
  profit: number
  roi: number
  biggestWinningOdd: number | null
  biggestSingleBetProfit: number | null
  longestWinStreak: number
  longestLossStreak: number
}

/**
 * Calcula as estatísticas de um perfil a partir de suas apostas e da
 * carteira já computada (ver walletService). Nada aqui é armazenado — tudo
 * é derivado sob demanda, do mesmo jeito que o saldo.
 */
export function computeProfileStatistics(
  profileId: string,
  allBets: Bet[],
  wallet: WalletSummary,
): ProfileStatistics {
  const bets = allBets.filter((bet) => bet.profileId === profileId)

  const wins = bets.filter((bet) => bet.status === 'WON')
  const losses = bets.filter((bet) => bet.status === 'LOST')
  const voided = bets.filter((bet) => bet.status === 'VOID')
  const pending = bets.filter((bet) => bet.status === 'PENDING')

  const decisiveCount = wins.length + losses.length
  const winRate = decisiveCount > 0 ? (wins.length / decisiveCount) * 100 : 0

  const totalReturned =
    wins.reduce((sum, bet) => sum + bet.stake + bet.potentialProfit, 0) +
    voided.reduce((sum, bet) => sum + bet.stake, 0)

  const biggestWinningOdd = wins.length > 0 ? Math.max(...wins.map((bet) => bet.oddSnapshot)) : null
  const biggestSingleBetProfit =
    wins.length > 0 ? Math.max(...wins.map((bet) => bet.potentialProfit)) : null

  // Sequências (streaks) são calculadas em ordem cronológica de liquidação.
  // VOID e PENDING não contam como vitória nem derrota, então são ignoradas
  // aqui (não quebram nem estendem a sequência).
  const settledChronological = bets
    .filter((bet) => (bet.status === 'WON' || bet.status === 'LOST') && bet.settledAt)
    .sort((a, b) => new Date(a.settledAt as string).getTime() - new Date(b.settledAt as string).getTime())

  let longestWinStreak = 0
  let longestLossStreak = 0
  let currentWinStreak = 0
  let currentLossStreak = 0

  for (const bet of settledChronological) {
    if (bet.status === 'WON') {
      currentWinStreak += 1
      currentLossStreak = 0
    } else {
      currentLossStreak += 1
      currentWinStreak = 0
    }
    longestWinStreak = Math.max(longestWinStreak, currentWinStreak)
    longestLossStreak = Math.max(longestLossStreak, currentLossStreak)
  }

  return {
    totalBets: bets.length,
    wins: wins.length,
    losses: losses.length,
    voided: voided.length,
    pending: pending.length,
    winRate,
    totalWagered: wallet.totalWagered,
    totalReturned,
    profit: wallet.profit,
    roi: wallet.roi,
    biggestWinningOdd,
    biggestSingleBetProfit,
    longestWinStreak,
    longestLossStreak,
  }
}

/**
 * Lucro/prejuízo de um perfil dentro de um evento específico — usado na
 * página de Histórico. `null` quando o perfil não tem nenhuma aposta
 * liquidada naquele evento (só pendentes, ou nenhuma aposta).
 */
export function computeProfileEventProfit(profileId: string, eventBets: Bet[]): number | null {
  const settled = eventBets.filter((bet) => bet.profileId === profileId && bet.status !== 'PENDING')
  if (settled.length === 0) return null

  return settled.reduce((sum, bet) => {
    if (bet.status === 'WON') return sum + bet.potentialProfit
    if (bet.status === 'LOST') return sum - bet.stake
    return sum // VOID: 0 — o valor nunca "saiu" do saldo total.
  }, 0)
}
