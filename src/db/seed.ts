import { db } from './schema'
import { createProfile } from '@/services/profileService'

export const DEFAULT_INITIAL_BALANCE = 100

/**
 * Roda uma única vez, na primeira inicialização do app: cria os dois
 * perfis padrão (Matheus e Amigo), cada um com 100 UFC Points, e as
 * configurações globais do app. Se já existir algum perfil, não faz nada.
 */
export async function seedInitialData(): Promise<void> {
  const existingProfilesCount = await db.profiles.count()
  if (existingProfilesCount > 0) return

  await createProfile({ name: 'Matheus', initialBalance: DEFAULT_INITIAL_BALANCE })
  await createProfile({ name: 'Amigo', initialBalance: DEFAULT_INITIAL_BALANCE })

  const now = new Date().toISOString()
  await db.settings.add({
    id: 'app-settings',
    currencyName: 'UFC Points',
    currencyAbbreviation: 'UFC P',
    defaultInitialBalance: DEFAULT_INITIAL_BALANCE,
    createdAt: now,
    updatedAt: now,
  })
}
