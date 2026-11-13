export interface WalletSummary {
  profileId: string
  /** Soma de todas as transações do perfil. */
  totalBalance: number
  /** Pontos reservados em apostas ainda não liquidadas (BET_PLACED sem contraparte). */
  pendingPoints: number
  /** totalBalance - pendingPoints. É o valor que pode ser usado em novas apostas. */
  availableBalance: number
  totalWagered: number
  totalWon: number
  totalLost: number
  profit: number
  /** Retorno sobre o total apostado, em porcentagem. */
  roi: number
}
