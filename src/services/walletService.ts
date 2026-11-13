import type { Transaction } from '@/types/transaction'
import type { WalletSummary } from '@/types/wallet'
import { roundToDisplay } from '@/utils/currency'

/**
 * Calcula o resumo da carteira de um perfil A PARTIR do histórico de
 * transações — o saldo nunca é um número solto, ele é sempre derivado
 * (ou sincronizado) a partir dos lançamentos.
 *
 * MODELO DE RESERVA (confirmado pelos exemplos do brief):
 * BET_PLACED é apenas um marcador de reserva no histórico — ele entra no
 * cálculo de `pendingPoints`, mas NUNCA na soma do `totalBalance`. O saldo
 * total só muda de fato quando a aposta é liquidada:
 *   - BET_WON  → soma o LUCRO (não o payout completo — o stake nunca saiu
 *     do total, ele só estava reservado).
 *   - BET_LOST → soma -stake (agora sim o valor é perdido de verdade).
 *   - BET_VOID → soma 0 (o valor nunca "saiu", então nada muda).
 *
 * Isso reproduz exatamente os exemplos do brief: apostar 20 de um saldo de
 * 100 deixa o disponível em 80 mas o total continua 100; ao vencer com odd
 * +200 (lucro 40), o saldo final vira 140; ao perder, vira 80.
 */
export function computeWalletSummary(profileId: string, allTransactions: Transaction[]): WalletSummary {
  const transactions = allTransactions.filter((t) => t.profileId === profileId)

  const totalBalance = transactions
    .filter((t) => t.type !== 'BET_PLACED')
    .reduce((sum, t) => sum + t.amount, 0)

  const placedBets = transactions.filter((t) => t.type === 'BET_PLACED')
  const settledBetIds = new Set(
    transactions
      .filter((t) => t.type === 'BET_WON' || t.type === 'BET_LOST' || t.type === 'BET_VOID')
      .map((t) => t.relatedBetId)
      .filter((id): id is string => Boolean(id)),
  )
  const pendingBets = placedBets.filter((t) => !t.relatedBetId || !settledBetIds.has(t.relatedBetId))
  const pendingPoints = Math.abs(pendingBets.reduce((sum, t) => sum + t.amount, 0))

  const availableBalance = totalBalance - pendingPoints

  const totalWagered = placedBets.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalWon = transactions.filter((t) => t.type === 'BET_WON').reduce((sum, t) => sum + t.amount, 0)
  const totalLost = transactions
    .filter((t) => t.type === 'BET_LOST')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const initialBalance = transactions.find((t) => t.type === 'INITIAL_BALANCE')?.amount ?? 0
  const profit = totalBalance - initialBalance
  const roi = totalWagered > 0 ? (profit / totalWagered) * 100 : 0

  return {
    profileId,
    totalBalance: roundToDisplay(totalBalance),
    pendingPoints: roundToDisplay(pendingPoints),
    availableBalance: roundToDisplay(availableBalance),
    totalWagered: roundToDisplay(totalWagered),
    totalWon: roundToDisplay(totalWon),
    totalLost: roundToDisplay(totalLost),
    profit: roundToDisplay(profit),
    roi: roundToDisplay(roi),
  }
}
