import { supabase } from '@/lib/supabase'
import { fromRow, fromRows, unwrap } from '@/lib/supabaseHelpers'
import { calculateProfit, calculatePayout, isValidAmericanOdd } from '@/utils/odds'
import type { Bet, BetSelection } from '@/types/bet'
import type { Fight } from '@/types/fight'

export async function listBets(): Promise<Bet[]> {
  const rows = unwrap(await supabase.from('bets').select('*').order('created_at'))
  return fromRows<Bet>(rows)
}

export async function getBetForProfileAndFight(profileId: string, fightId: string): Promise<Bet | undefined> {
  const row = unwrap(
    await supabase
      .from('bets')
      .select('*')
      .eq('profile_id', profileId)
      .eq('fight_id', fightId)
      .maybeSingle(),
  )
  return row ? fromRow<Bet>(row) : undefined
}

export interface PlaceBetInput {
  profileId: string
  fight: Fight
  selection: BetSelection
  stake: number
}

/**
 * Registra uma aposta do tipo "Vencedor da luta".
 *
 * A validação final acontece no banco (função place_bet), de forma atômica:
 *  - valor da aposta > 0
 *  - odd válida e igual à odd atual da luta
 *  - luta sem resultado
 *  - uma aposta por perfil por luta
 *  - valor da aposta <= saldo disponível do perfil
 * Aqui ficam só as checagens rápidas e o cálculo do lucro/payout potencial.
 */
export async function placeBet(input: PlaceBetInput): Promise<Bet> {
  const { profileId, fight, selection, stake } = input

  if (!(stake > 0)) {
    throw new Error('O valor apostado deve ser maior que zero.')
  }

  const oddSnapshot = selection === 'FIGHTER_A' ? fight.oddFighterA : fight.oddFighterB
  if (!isValidAmericanOdd(oddSnapshot)) {
    throw new Error('Esta luta não possui uma odd válida para o lutador escolhido.')
  }

  const row = unwrap(
    await supabase.rpc('place_bet', {
      p_profile: profileId,
      p_fight: fight.id,
      p_selection: selection,
      p_stake: stake,
      p_odd_snapshot: oddSnapshot,
      p_potential_profit: calculateProfit(stake, oddSnapshot),
      p_potential_payout: calculatePayout(stake, oddSnapshot),
    }),
  )
  return fromRow<Bet>(row)
}

/** Cancela uma aposta ainda pendente, revertendo a reserva de pontos por completo. */
export async function cancelPendingBet(betId: string): Promise<void> {
  unwrap(await supabase.rpc('cancel_pending_bet', { p_bet: betId }))
}
