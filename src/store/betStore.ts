import { create } from 'zustand'
import * as betService from '@/services/betService'
import { useProfileStore } from './profileStore'
import type { Bet, BetSelection } from '@/types/bet'
import type { Fight } from '@/types/fight'

interface PlaceBetArgs {
  profileId: string
  fight: Fight
  selection: BetSelection
  stake: number
}

interface BetState {
  bets: Bet[]
  isLoading: boolean
  error: string | null

  loadBets: () => Promise<void>
  placeBet: (input: PlaceBetArgs) => Promise<void>
  cancelPendingBet: (betId: string) => Promise<void>
}

export const useBetStore = create<BetState>((set, get) => ({
  bets: [],
  isLoading: false,
  error: null,

  loadBets: async () => {
    set({ isLoading: true, error: null })
    try {
      const bets = await betService.listBets()
      set({ bets })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar apostas.' })
    } finally {
      set({ isLoading: false })
    }
  },

  placeBet: async (input) => {
    await betService.placeBet(input)
    await get().loadBets()
    // Uma aposta nova reserva pontos: a carteira do perfil precisa refletir
    // isso imediatamente (saldo disponível cai, saldo total permanece).
    await useProfileStore.getState().refresh()
  },

  cancelPendingBet: async (betId) => {
    await betService.cancelPendingBet(betId)
    await get().loadBets()
    await useProfileStore.getState().refresh()
  },
}))
