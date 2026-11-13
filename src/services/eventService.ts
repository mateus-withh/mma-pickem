import { db } from '@/db/schema'
import { generateId } from '@/utils/id'
import type { MmaEvent, EventType, EventStatus } from '@/types/event'

export async function listEvents(): Promise<MmaEvent[]> {
  const events = await db.events.toArray()
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function getEvent(id: string): Promise<MmaEvent | undefined> {
  return db.events.get(id)
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

  const now = new Date().toISOString()
  const event: MmaEvent = {
    id: generateId(),
    name,
    date: input.date,
    location: input.location.trim(),
    arena: input.arena.trim(),
    type: input.type,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  }

  await db.events.add(event)
  return event
}

export type UpdateEventInput = Partial<CreateEventInput>

export async function updateEvent(id: string, changes: UpdateEventInput): Promise<void> {
  if (changes.name !== undefined) {
    const trimmed = changes.name.trim()
    if (!trimmed) throw new Error('O nome do evento é obrigatório.')
    changes = { ...changes, name: trimmed }
  }

  await db.events.update(id, { ...changes, updatedAt: new Date().toISOString() })
}

/** Remove o evento e todas as suas lutas (ainda não existem apostas nas Fases 1-3). */
export async function deleteEvent(id: string): Promise<void> {
  await db.transaction('rw', db.events, db.fights, async () => {
    await db.fights.where('eventId').equals(id).delete()
    await db.events.delete(id)
  })
}
