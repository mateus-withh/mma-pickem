import { db } from '@/db/schema'
import { generateId } from '@/utils/id'
import type { Profile } from '@/types/profile'
import type { Transaction } from '@/types/transaction'

export async function listProfiles(): Promise<Profile[]> {
  return db.profiles.orderBy('createdAt').toArray()
}

export async function listTransactions(): Promise<Transaction[]> {
  return db.transactions.orderBy('createdAt').toArray()
}

export interface CreateProfileInput {
  name: string
  initialBalance: number
}

/**
 * Cria um perfil e já registra a transação INITIAL_BALANCE correspondente.
 * Um perfil nunca existe sem sua transação de saldo inicial no histórico.
 */
export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const name = input.name.trim()
  if (!name) throw new Error('O nome do perfil é obrigatório.')
  if (input.initialBalance < 0) throw new Error('O saldo inicial não pode ser negativo.')

  const now = new Date().toISOString()
  const profile: Profile = {
    id: generateId(),
    name,
    initialBalance: input.initialBalance,
    active: true,
    createdAt: now,
    updatedAt: now,
  }

  await db.transaction('rw', db.profiles, db.transactions, async () => {
    await db.profiles.add(profile)
    await db.transactions.add({
      id: generateId(),
      profileId: profile.id,
      type: 'INITIAL_BALANCE',
      amount: input.initialBalance,
      description: 'Saldo inicial.',
      createdAt: now,
    })
  })

  return profile
}

export interface UpdateProfileInput {
  name?: string
  active?: boolean
  avatarUrl?: string
}

/** Atualiza apenas dados cadastrais do perfil — nunca o saldo. */
export async function updateProfileInfo(id: string, changes: UpdateProfileInput): Promise<void> {
  if (changes.name !== undefined) {
    const trimmed = changes.name.trim()
    if (!trimmed) throw new Error('O nome do perfil é obrigatório.')
    changes = { ...changes, name: trimmed }
  }

  await db.profiles.update(id, { ...changes, updatedAt: new Date().toISOString() })
}

/**
 * Ajuste manual de administrador. SEMPRE cria uma transação
 * MANUAL_ADJUSTMENT — o saldo do perfil nunca é escrito diretamente.
 */
export async function adjustBalance(profileId: string, amount: number, reason: string): Promise<void> {
  if (!amount || amount === 0) throw new Error('O valor do ajuste não pode ser zero.')
  const trimmedReason = reason.trim()
  if (!trimmedReason) throw new Error('Informe um motivo para o ajuste.')

  await db.transactions.add({
    id: generateId(),
    profileId,
    type: 'MANUAL_ADJUSTMENT',
    amount,
    description: trimmedReason,
    createdAt: new Date().toISOString(),
  })
}

/**
 * Altera o saldo inicial de um perfil (configuração administrativa).
 * Isso atualiza a transação INITIAL_BALANCE existente em vez de criar um
 * novo número solto — o saldo continua 100% derivado do histórico.
 */
export async function setInitialBalance(profileId: string, newInitialBalance: number): Promise<void> {
  if (newInitialBalance < 0) throw new Error('O saldo inicial não pode ser negativo.')

  const now = new Date().toISOString()

  await db.transaction('rw', db.profiles, db.transactions, async () => {
    const profileTransactions = await db.transactions.where('profileId').equals(profileId).toArray()
    const initialTransaction = profileTransactions.find((t) => t.type === 'INITIAL_BALANCE')

    if (initialTransaction) {
      await db.transactions.update(initialTransaction.id, {
        amount: newInitialBalance,
        description: 'Saldo inicial (ajustado nas configurações administrativas).',
      })
    } else {
      await db.transactions.add({
        id: generateId(),
        profileId,
        type: 'INITIAL_BALANCE',
        amount: newInitialBalance,
        description: 'Saldo inicial (ajustado nas configurações administrativas).',
        createdAt: now,
      })
    }

    await db.profiles.update(profileId, { initialBalance: newInitialBalance, updatedAt: now })
  })
}
