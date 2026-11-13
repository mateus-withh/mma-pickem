import { supabase } from '@/lib/supabase'
import { fromRow, fromRows, toRow, unwrap } from '@/lib/supabaseHelpers'
import { generateId } from '@/utils/id'
import type { Profile } from '@/types/profile'
import type { Transaction } from '@/types/transaction'

export async function listProfiles(): Promise<Profile[]> {
  const rows = unwrap(await supabase.from('profiles').select('*').order('created_at'))
  return fromRows<Profile>(rows)
}

export async function listTransactions(): Promise<Transaction[]> {
  const rows = unwrap(await supabase.from('transactions').select('*').order('created_at'))
  return fromRows<Transaction>(rows)
}

export interface CreateProfileInput {
  name: string
  initialBalance: number
}

/**
 * Cria um perfil e já registra a transação INITIAL_BALANCE correspondente
 * (feito de forma atômica pela função create_profile no banco).
 */
export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const name = input.name.trim()
  if (!name) throw new Error('O nome do perfil é obrigatório.')
  if (input.initialBalance < 0) throw new Error('O saldo inicial não pode ser negativo.')

  const row = unwrap(
    await supabase.rpc('create_profile', {
      p_name: name,
      p_initial_balance: input.initialBalance,
    }),
  )
  return fromRow<Profile>(row)
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

  unwrap(await supabase.from('profiles').update(toRow(changes)).eq('id', id))
}

/**
 * Ajuste manual de administrador. SEMPRE cria uma transação
 * MANUAL_ADJUSTMENT — o saldo do perfil nunca é escrito diretamente.
 */
export async function adjustBalance(profileId: string, amount: number, reason: string): Promise<void> {
  if (!amount || amount === 0) throw new Error('O valor do ajuste não pode ser zero.')
  const trimmedReason = reason.trim()
  if (!trimmedReason) throw new Error('Informe um motivo para o ajuste.')

  unwrap(
    await supabase.from('transactions').insert({
      id: generateId(),
      profile_id: profileId,
      type: 'MANUAL_ADJUSTMENT',
      amount,
      description: trimmedReason,
    }),
  )
}

/**
 * Altera o saldo inicial de um perfil (configuração administrativa).
 * A função set_initial_balance atualiza a transação INITIAL_BALANCE existente
 * em vez de criar um número solto — o saldo continua 100% derivado do histórico.
 */
export async function setInitialBalance(profileId: string, newInitialBalance: number): Promise<void> {
  if (newInitialBalance < 0) throw new Error('O saldo inicial não pode ser negativo.')

  unwrap(
    await supabase.rpc('set_initial_balance', {
      p_profile: profileId,
      p_amount: newInitialBalance,
    }),
  )
}
