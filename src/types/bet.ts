export type BetSelection = 'FIGHTER_A' | 'FIGHTER_B'

export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'VOID'

/** Apenas "WINNER" implementado por enquanto — estrutura pronta para
 * Método da vitória, Round, Over/Under e Parlay no futuro. */
export type BetType = 'WINNER'

export interface Bet {
  id: string
  profileId: string
  fightId: string
  eventId: string
  betType: BetType
  selection: BetSelection
  stake: number
  /** Odd no momento em que a aposta foi feita — NUNCA recalculada com a odd atual da luta. */
  oddSnapshot: number
  status: BetStatus
  potentialProfit: number
  potentialPayout: number
  createdAt: string
  updatedAt: string
  settledAt?: string
}
