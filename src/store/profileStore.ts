import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import * as profileService from '@/services/profileService'
import { computeWalletSummary } from '@/services/walletService'
import type { Profile } from '@/types/profile'
import type { Transaction } from '@/types/transaction'
import type { WalletSummary } from '@/types/wallet'

interface ProfileState {
  profiles: Profile[]
  transactions: Transaction[]
  wallets: Record<string, WalletSummary>
  /** Perfil vinculado ao login atual (null se o login ainda não foi vinculado a um perfil). */
  myProfileId: string | null
  /** O perfil do login atual é administrador? */
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  hasInitialized: boolean

  init: () => Promise<void>
  refresh: () => Promise<void>
  createProfile: (input: profileService.CreateProfileInput) => Promise<void>
  updateProfile: (id: string, changes: profileService.UpdateProfileInput) => Promise<void>
  adjustBalance: (profileId: string, amount: number, reason: string) => Promise<void>
  setInitialBalance: (profileId: string, amount: number) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  transactions: [],
  wallets: {},
  myProfileId: null,
  isAdmin: false,
  isLoading: false,
  error: null,
  hasInitialized: false,

  init: async () => {
    if (get().hasInitialized) return
    set({ isLoading: true, error: null })
    try {
      // Sem seed local: os perfis (Matheus e Amigo) vivem no banco compartilhado.
      await get().refresh()
      set({ hasInitialized: true })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar dados.' })
    } finally {
      set({ isLoading: false })
    }
  },

  refresh: async () => {
    const [profiles, transactions, sessionResult] = await Promise.all([
      profileService.listProfiles(),
      profileService.listTransactions(),
      supabase.auth.getSession(),
    ])
    const wallets = Object.fromEntries(
      profiles.map((profile) => [profile.id, computeWalletSummary(profile.id, transactions)]),
    )

    const userId = sessionResult.data.session?.user.id
    const me = userId ? profiles.find((profile) => profile.userId === userId) : undefined

    set({
      profiles,
      transactions,
      wallets,
      myProfileId: me?.id ?? null,
      isAdmin: me?.isAdmin === true,
    })
  },

  createProfile: async (input) => {
    await profileService.createProfile(input)
    await get().refresh()
  },

  updateProfile: async (id, changes) => {
    await profileService.updateProfileInfo(id, changes)
    await get().refresh()
  },

  adjustBalance: async (profileId, amount, reason) => {
    await profileService.adjustBalance(profileId, amount, reason)
    await get().refresh()
  },

  setInitialBalance: async (profileId, amount) => {
    await profileService.setInitialBalance(profileId, amount)
    await get().refresh()
  },
}))
