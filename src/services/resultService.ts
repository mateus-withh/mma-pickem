import { db } from '@/db/schema'
import { generateId } from '@/utils/id'
import { calculateProfit } from '@/utils/odds'
import type { FightResult, FightOutcome, ResultAuditEntry } from '@/types/fightResult'
import type { Bet } from '@/types/bet'

export async function getResultForFight(fightId: string): Promise<FightResult | undefined> {
  return db.results.where('fightId').equals(fightId).first()
}

export async function listResultAudits(fightId: string): Promise<ResultAuditEntry[]> {
  const audits = await db.resultAudits.where('fightId').equals(fightId).toArray()
  return audits.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
}

export interface RegisterResultInput {
  fightId: string
  eventId: string
  outcome: FightOutcome
  method?: string
  round?: number
  time?: string
  notes?: string
}

/**
 * Reverte a liquidação de todas as apostas de uma luta: apaga as
 * transações de liquidação (BET_WON / BET_LOST / BET_VOID) e devolve cada
 * aposta para PENDING. A transação BET_PLACED original NUNCA é tocada —
 * ela continua representando a reserva original dos pontos.
 */
async function revertSettlementForFight(fightId: string): Promise<void> {
  const bets = await db.bets.where('fightId').equals(fightId).toArray()
  const settledBets = bets.filter((bet) => bet.status !== 'PENDING')

  for (const bet of settledBets) {
    const profileTransactions = await db.transactions.where('profileId').equals(bet.profileId).toArray()
    const settlementTransactions = profileTransactions.filter(
      (t) => t.relatedBetId === bet.id && t.type !== 'BET_PLACED',
    )
    for (const transaction of settlementTransactions) {
      await db.transactions.delete(transaction.id)
    }
    await db.bets.update(bet.id, {
      status: 'PENDING',
      settledAt: undefined,
      updatedAt: new Date().toISOString(),
    })
  }
}

async function settleAsWin(bet: Bet, now: string): Promise<void> {
  // O lucro (não o payout completo) é o que de fato entra no saldo total —
  // o stake nunca "saiu" dele, estava só reservado (ver walletService).
  const profit = calculateProfit(bet.stake, bet.oddSnapshot)
  await db.transactions.add({
    id: generateId(),
    profileId: bet.profileId,
    type: 'BET_WON',
    amount: profit,
    description: 'Aposta vencedora.',
    relatedBetId: bet.id,
    createdAt: now,
  })
  await db.bets.update(bet.id, { status: 'WON', settledAt: now, updatedAt: now })
}

async function settleAsLoss(bet: Bet, now: string): Promise<void> {
  await db.transactions.add({
    id: generateId(),
    profileId: bet.profileId,
    type: 'BET_LOST',
    amount: -bet.stake,
    description: 'Aposta perdida.',
    relatedBetId: bet.id,
    createdAt: now,
  })
  await db.bets.update(bet.id, { status: 'LOST', settledAt: now, updatedAt: now })
}

async function settleAsVoid(bet: Bet, now: string): Promise<void> {
  // Amount 0: o valor apostado nunca chegou a sair do saldo total (só
  // estava reservado via BET_PLACED), então a devolução de 100% do stake
  // não exige nenhuma movimentação adicional no saldo.
  await db.transactions.add({
    id: generateId(),
    profileId: bet.profileId,
    type: 'BET_VOID',
    amount: 0,
    description: 'Aposta anulada (empate/No Contest) — valor apostado devolvido integralmente.',
    relatedBetId: bet.id,
    createdAt: now,
  })
  await db.bets.update(bet.id, { status: 'VOID', settledAt: now, updatedAt: now })
}

/**
 * Liquida — uma única vez — todas as apostas PENDENTES de uma luta, de
 * acordo com o resultado. `registerResult` sempre reverte a liquidação
 * anterior antes de chamar esta função, então nunca há uma aposta
 * liquidada duas vezes.
 */
async function settleBetsForFight(fightId: string, outcome: FightOutcome): Promise<void> {
  const bets = await db.bets.where('fightId').equals(fightId).toArray()
  const pendingBets = bets.filter((bet) => bet.status === 'PENDING')
  const now = new Date().toISOString()

  for (const bet of pendingBets) {
    if (outcome === 'DRAW' || outcome === 'NO_CONTEST') {
      await settleAsVoid(bet, now)
    } else if (bet.selection === outcome) {
      await settleAsWin(bet, now)
    } else {
      await settleAsLoss(bet, now)
    }
  }
}

/**
 * Registra (ou corrige) o resultado de uma luta e liquida automaticamente
 * todas as apostas pendentes daquela luta.
 *
 * Se já existir um resultado para essa luta, a liquidação anterior é
 * revertida por completo antes de aplicar o novo resultado — nunca
 * duplica ganhos ou perdas — e uma entrada de auditoria é registrada.
 */
export async function registerResult(input: RegisterResultInput): Promise<FightResult> {
  const now = new Date().toISOString()

  return db.transaction('rw', db.results, db.resultAudits, db.bets, db.transactions, async () => {
    const existing = await getResultForFight(input.fightId)

    if (existing) {
      await revertSettlementForFight(input.fightId)
      await db.resultAudits.add({
        id: generateId(),
        fightId: input.fightId,
        eventId: input.eventId,
        previousOutcome: existing.outcome,
        newOutcome: input.outcome,
        changedAt: now,
      })
      await db.results.update(existing.id, {
        outcome: input.outcome,
        method: input.method,
        round: input.round,
        time: input.time,
        notes: input.notes,
        updatedAt: now,
      })
    } else {
      await db.resultAudits.add({
        id: generateId(),
        fightId: input.fightId,
        eventId: input.eventId,
        previousOutcome: null,
        newOutcome: input.outcome,
        changedAt: now,
      })
      await db.results.add({
        id: generateId(),
        fightId: input.fightId,
        eventId: input.eventId,
        outcome: input.outcome,
        method: input.method,
        round: input.round,
        time: input.time,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
      })
    }

    await settleBetsForFight(input.fightId, input.outcome)

    const result = await getResultForFight(input.fightId)
    if (!result) throw new Error('Erro ao registrar o resultado.')
    return result
  })
}

/** Remove o resultado de uma luta e reverte a liquidação — as apostas voltam a ficar pendentes. */
export async function deleteResult(fightId: string): Promise<void> {
  const existing = await getResultForFight(fightId)
  if (!existing) return

  await db.transaction('rw', db.results, db.bets, db.transactions, async () => {
    await revertSettlementForFight(fightId)
    await db.results.delete(existing.id)
  })
}
