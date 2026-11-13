import { db } from '@/db/schema'
import { generateId } from '@/utils/id'
import { calculateProfit, calculatePayout, isValidAmericanOdd } from '@/utils/odds'
import { computeWalletSummary } from './walletService'
import { getResultForFight } from './resultService'
import type { Bet, BetSelection } from '@/types/bet'
import type { Fight } from '@/types/fight'

export async function listBets(): Promise<Bet[]> {
  return db.bets.orderBy('createdAt').toArray()
}

export async function getBetForProfileAndFight(profileId: string, fightId: string): Promise<Bet | undefined> {
  const bets = await db.bets.where('profileId').equals(profileId).toArray()
  return bets.find((bet) => bet.fightId === fightId)
}

export interface PlaceBetInput {
  profileId: string
  fight: Fight
  selection: BetSelection
  stake: number
}

/**
 * Registra uma aposta do tipo "Vencedor da luta" — o único tipo implementado
 * por enquanto (a estrutura já suporta os futuros: Método, Round,
 * Over/Under, Parlay).
 *
 * Regras de integridade aplicadas aqui (nunca só na UI):
 *  - valor da aposta > 0
 *  - odd válida (≠ 0)
 *  - uma aposta por perfil por luta
 *  - valor da aposta <= saldo disponível do perfil
 */
export async function placeBet(input: PlaceBetInput): Promise<Bet> {
  const { profileId, fight, selection, stake } = input

  if (!(stake > 0)) {
    throw new Error('O valor apostado deve ser maior que zero.')
  }

  const existingResult = await getResultForFight(fight.id)
  if (existingResult) {
    throw new Error('Esta luta já foi finalizada e não aceita novas apostas.')
  }

  const oddSnapshot = selection === 'FIGHTER_A' ? fight.oddFighterA : fight.oddFighterB
  if (!isValidAmericanOdd(oddSnapshot)) {
    throw new Error('Esta luta não possui uma odd válida para o lutador escolhido.')
  }

  const existingBet = await getBetForProfileAndFight(profileId, fight.id)
  if (existingBet) {
    throw new Error('Este perfil já possui uma aposta nesta luta.')
  }

  const profileTransactions = await db.transactions.where('profileId').equals(profileId).toArray()
  const wallet = computeWalletSummary(profileId, profileTransactions)
  if (stake > wallet.availableBalance) {
    throw new Error('Saldo disponível insuficiente para essa aposta.')
  }

  const fighterName = selection === 'FIGHTER_A' ? fight.fighterAName : fight.fighterBName
  const potentialProfit = calculateProfit(stake, oddSnapshot)
  const potentialPayout = calculatePayout(stake, oddSnapshot)

  const now = new Date().toISOString()
  const bet: Bet = {
    id: generateId(),
    profileId,
    fightId: fight.id,
    eventId: fight.eventId,
    betType: 'WINNER',
    selection,
    stake,
    oddSnapshot,
    status: 'PENDING',
    potentialProfit,
    potentialPayout,
    createdAt: now,
    updatedAt: now,
  }

  await db.transaction('rw', db.bets, db.transactions, async () => {
    await db.bets.add(bet)
    // Este lançamento é só um marcador de reserva no histórico: ele NUNCA
    // entra na soma do saldo total (ver walletService), apenas no cálculo
    // dos pontos pendentes, até a aposta ser liquidada na Fase 5.
    await db.transactions.add({
      id: generateId(),
      profileId,
      type: 'BET_PLACED',
      amount: -stake,
      description: `Aposta em ${fighterName}.`,
      relatedBetId: bet.id,
      createdAt: now,
    })
  })

  return bet
}

/** Cancela uma aposta ainda pendente, revertendo a reserva de pontos por completo. */
export async function cancelPendingBet(betId: string): Promise<void> {
  const bet = await db.bets.get(betId)
  if (!bet) throw new Error('Aposta não encontrada.')
  if (bet.status !== 'PENDING') {
    throw new Error('Apenas apostas pendentes podem ser canceladas.')
  }

  await db.transaction('rw', db.bets, db.transactions, async () => {
    const profileTransactions = await db.transactions.where('profileId').equals(bet.profileId).toArray()
    const relatedTransactions = profileTransactions.filter((t) => t.relatedBetId === betId)
    for (const transaction of relatedTransactions) {
      await db.transactions.delete(transaction.id)
    }
    await db.bets.delete(betId)
  })
}
