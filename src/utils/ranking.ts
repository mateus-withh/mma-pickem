import type { Profile } from '@/types/profile'
import type { WalletSummary } from '@/types/wallet'
import type { Bet } from '@/types/bet'

export interface RankingEntry {
  profile: Profile
  wallet: WalletSummary
  winsCount: number
  betsCount: number
}

export type RankingSortKey = 'balance' | 'profit' | 'roi' | 'wins'

export const RANKING_SORT_LABELS: Record<RankingSortKey, string> = {
  balance: 'Saldo',
  profit: 'Lucro',
  roi: 'ROI',
  wins: 'Vitórias',
}

function emptyWallet(profile: Profile): WalletSummary {
  return {
    profileId: profile.id,
    totalBalance: profile.initialBalance,
    pendingPoints: 0,
    availableBalance: profile.initialBalance,
    totalWagered: 0,
    totalWon: 0,
    totalLost: 0,
    profit: 0,
    roi: 0,
  }
}

export function buildRanking(
  profiles: Profile[],
  wallets: Record<string, WalletSummary>,
  bets: Bet[],
): RankingEntry[] {
  return profiles.map((profile) => {
    const profileBets = bets.filter((bet) => bet.profileId === profile.id)
    return {
      profile,
      wallet: wallets[profile.id] ?? emptyWallet(profile),
      winsCount: profileBets.filter((bet) => bet.status === 'WON').length,
      betsCount: profileBets.length,
    }
  })
}

export function sortRanking(entries: RankingEntry[], sortKey: RankingSortKey): RankingEntry[] {
  const sorted = [...entries]
  switch (sortKey) {
    case 'balance':
      sorted.sort((a, b) => b.wallet.totalBalance - a.wallet.totalBalance)
      break
    case 'profit':
      sorted.sort((a, b) => b.wallet.profit - a.wallet.profit)
      break
    case 'roi':
      sorted.sort((a, b) => b.wallet.roi - a.wallet.roi)
      break
    case 'wins':
      sorted.sort((a, b) => b.winsCount - a.winsCount)
      break
  }
  return sorted
}

export function medalForPosition(position: number): string | null {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return null
}
