export type FightOutcome = 'FIGHTER_A' | 'FIGHTER_B' | 'DRAW' | 'NO_CONTEST'

export interface FightResult {
  id: string
  fightId: string
  eventId: string
  outcome: FightOutcome
  method?: string
  round?: number
  time?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Registro de auditoria: toda vez que um resultado é criado OU corrigido,
 * uma entrada é gravada aqui — nunca é apagada, mesmo quando o resultado
 * em si é corrigido de novo.
 */
export interface ResultAuditEntry {
  id: string
  fightId: string
  eventId: string
  previousOutcome: FightOutcome | null
  newOutcome: FightOutcome
  changedAt: string
}
