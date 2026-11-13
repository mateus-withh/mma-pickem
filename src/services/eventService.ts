import { supabase } from '@/lib/supabase'
import { fromRow, fromRows, toRow, unwrap } from '@/lib/supabaseHelpers'
import { generateId } from '@/utils/id'
import type { MmaEvent, EventType, EventStatus } from '@/types/event'

export async function listEvents(): Promise<MmaEvent[]> {
  const rows = unwrap(await supabase.from('events').select('*'))
  const events = fromRows<MmaEvent>(rows)
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function getEvent(id: string): Promise<MmaEvent | undefined> {
  const row = unwrap(await supabase.from('events').select('*').eq('id', id).maybeSingle())
  return row ? fromRow<MmaEvent>(row) : undefined
}

export interface CreateEventInput {
  name: string
  date: string
  location: string
  arena: string
  type: EventType
  status: EventStatus
}

export async function createEvent(input: CreateEventInput): Promise<MmaEvent> {
  const name = input.name.trim()
  if (!name) throw new Error('O nome do evento é obrigatório.')
  if (!input.date) throw new Error('A data do evento é obrigatória.')

  const row = unwrap(
    await supabase
      .from('events')
      .insert({
        id: generateId(),
        name,
        date: input.date,
        location: input.location.trim(),
        arena: input.arena.trim(),
        type: input.type,
        status: input.status,
      })
      .select()
      .single(),
  )
  return fromRow<MmaEvent>(row)
}

export type UpdateEventInput = Partial<CreateEventInput>

export async function updateEvent(id: string, changes: UpdateEventInput): Promise<void> {
  if (changes.name !== undefined) {
    const trimmed = changes.name.trim()
    if (!trimmed) throw new Error('O nome do evento é obrigatório.')
    changes = { ...changes, name: trimmed }
  }

  unwrap(await supabase.from('events').update(toRow(changes)).eq('id', id))
}

/**
 * Remove o evento e todas as suas lutas. O banco bloqueia a exclusão se
 * alguma luta do evento já tiver apostas (para nunca bagunçar os saldos).
 */
export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) {
    throw new Error(
      error.code === '23503'
        ? 'Não é possível excluir este evento: já existem apostas nas lutas dele.'
        : error.message,
    )
  }
}
