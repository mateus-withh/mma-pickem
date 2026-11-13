import { create } from 'zustand'
import * as resultService from '@/services/resultService'
import { useBetStore } from './betStore'
import { useProfileStore } from './profileStore'
import type { FightResult } from '@/types/fightResult'

interface ResultState {
  resultsByFight: Record<string, FightResult | undefined>
  isLoading: boolean
  error: string | null

  loadResult: (fightId: string) => Promise<void>
  registerResult: (input: resultService.RegisterResultInput) => Promise<void>
  deleteResult: (fightId: string) => Promise<void>
}

export const useResultStore = create<ResultState>((set, get) => ({
  resultsByFight: {},
  isLoading: false,
  error: null,

  loadResult: async (fightId) => {
    const result = await resultService.getResultForFight(fightId)
    set((state) => ({ resultsByFight: { ...state.resultsByFight, [fightId]: result } }))
  },

  registerResult: async (input) => {
    set({ isLoading: true, error: null })
    try {
      await resultService.registerResult(input)
      await get().loadResult(input.fightId)
      // A liquidação altera apostas e cria transações — os outros stores
      // precisam refletir isso imediatamente.
      await useBetStore.getState().loadBets()
      await useProfileStore.getState().refresh()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao registrar resultado.' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  deleteResult: async (fightId) => {
    await resultService.deleteResult(fightId)
    set((state) => ({ resultsByFight: { ...state.resultsByFight, [fightId]: undefined } }))
    await useBetStore.getState().loadBets()
    await useProfileStore.getState().refresh()
  },
}))
