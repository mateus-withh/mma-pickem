export type TransactionType =
  | 'INITIAL_BALANCE'
  | 'BET_PLACED'
  | 'BET_WON'
  | 'BET_LOST'
  | 'BET_VOID'
  | 'MANUAL_ADJUSTMENT'

export interface Transaction {
  id: string
  profileId: string
  type: TransactionType
  /** Positivo = crédito, negativo = débito. */
  amount: number
  description: string
  /** Reservado para as Fases 4/5, quando cada transação de aposta referenciará a bet de origem. */
  relatedBetId?: string
  createdAt: string
}
