import { supabase } from '@/lib/supabase'
import { fromRow, fromRows, toRow, unwrap } from '@/lib/supabaseHelpers'
import { generateId } from '@/utils/id'
import { isValidAmericanOdd } from '@/utils/odds'
import type { Fight } from '@/types/fight'

export async function listFightsByEvent(eventId: string): Promise<Fight[]> {
  const rows = unwrap(
    await supabase.from('fights').select('*').eq('event_id', eventId).order('card_position'),
  )
  return fromRows<Fight>(rows)
}

export interface CreateFightInput {
  eventId: string
  fighterAName: string
  fighterBName: string
  weightClass: string
  rounds: 3 | 5
  cardPosition: number
  isMainEvent: boolean
  isCoMainEvent: boolean
  isTitleFight: boolean
  oddFighterA: number
  oddFighterB: number
}

function assertValidFightInput(input: CreateFightInput | UpdateFightInput): void {
  if (input.fighterAName !== undefined && !input.fighterAName.trim()) {
    throw new Error('O nome do Lutador A é obrigatório.')
  }
  if (input.fighterBName !== undefined && !input.fighterBName.trim()) {
    throw new Error('O nome do Lutador B é obrigatório.')
  }
  if (
    input.fighterAName !== undefined &&
    input.fighterBName !== undefined &&
    input.fighterAName.trim().toLowerCase() === input.fighterBName.trim().toLowerCase()
  ) {
    throw new Error('Lutador A e Lutador B não podem ser o mesmo lutador.')
  }
  if (input.oddFighterA !== undefined && !isValidAmericanOdd(input.oddFighterA)) {
    throw new Error('A odd do Lutador A deve ser uma odd americana válida (ex: -150, +130).')
  }
  if (input.oddFighterB !== undefined && !isValidAmericanOdd(input.oddFighterB)) {
    throw new Error('A odd do Lutador B deve ser uma odd americana válida (ex: -150, +130).')
  }
}

/**
 * No máximo uma luta Main Event e uma Co-Main por evento: ao marcar uma nova,
 * o próprio banco desmarca as demais (trigger trg_fights_highlight).
 */
export async function createFight(input: CreateFightInput): Promise<Fight> {
  assertValidFightInput(input)

  const row = unwrap(
    await supabase
      .from('fights')
      .insert({
        ...toRow(input),
        id: generateId(),
        fighter_a_name: input.fighterAName.trim(),
        fighter_b_name: input.fighterBName.trim(),
      })
      .select()
      .single(),
  )
  return fromRow<Fight>(row)
}

export type UpdateFightInput = Partial<Omit<CreateFightInput, 'eventId'>>

export async function updateFight(id: string, changes: UpdateFightInput): Promise<void> {
  assertValidFightInput(changes)

  const patch: UpdateFightInput = { ...changes }
  if (patch.fighterAName !== undefined) patch.fighterAName = patch.fighterAName.trim()
  if (patch.fighterBName !== undefined) patch.fighterBName = patch.fighterBName.trim()

  const updated = unwrap(await supabase.from('fights').update(toRow(patch)).eq('id', id).select('id'))
  if (!updated || updated.length === 0) throw new Error('Luta não encontrada.')
}

/** O banco bloqueia a exclusão de uma luta que já tem apostas. */
export async function deleteFight(id: string): Promise<void> {
  const { error } = await supabase.from('fights').delete().eq('id', id)
  if (error) {
    throw new Error(
      error.code === '23503'
        ? 'Não é possível excluir esta luta: já existem apostas nela.'
        : error.message,
    )
  }
}
