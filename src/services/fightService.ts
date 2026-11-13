import { db } from '@/db/schema'
import { generateId } from '@/utils/id'
import { isValidAmericanOdd } from '@/utils/odds'
import type { Fight } from '@/types/fight'

export async function listFightsByEvent(eventId: string): Promise<Fight[]> {
  const fights = await db.fights.where('eventId').equals(eventId).toArray()
  return fights.sort((a, b) => a.cardPosition - b.cardPosition)
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
 * Garante que exista no máximo uma luta marcada como Main Event e uma
 * marcada como Co-Main Event por evento — ao marcar uma nova, desmarca
 * as demais do mesmo evento.
 */
async function enforceSingleCardHighlight(
  eventId: string,
  fightIdToSkip: string | undefined,
  changes: { isMainEvent?: boolean; isCoMainEvent?: boolean },
): Promise<void> {
  const siblings = await db.fights.where('eventId').equals(eventId).toArray()

  if (changes.isMainEvent) {
    for (const sibling of siblings) {
      if (sibling.id !== fightIdToSkip && sibling.isMainEvent) {
        await db.fights.update(sibling.id, { isMainEvent: false })
      }
    }
  }

  if (changes.isCoMainEvent) {
    for (const sibling of siblings) {
      if (sibling.id !== fightIdToSkip && sibling.isCoMainEvent) {
        await db.fights.update(sibling.id, { isCoMainEvent: false })
      }
    }
  }
}

export async function createFight(input: CreateFightInput): Promise<Fight> {
  assertValidFightInput(input)

  const now = new Date().toISOString()
  const fight: Fight = {
    id: generateId(),
    eventId: input.eventId,
    fighterAName: input.fighterAName.trim(),
    fighterBName: input.fighterBName.trim(),
    weightClass: input.weightClass,
    rounds: input.rounds,
    cardPosition: input.cardPosition,
    isMainEvent: input.isMainEvent,
    isCoMainEvent: input.isCoMainEvent,
    isTitleFight: input.isTitleFight,
    oddFighterA: input.oddFighterA,
    oddFighterB: input.oddFighterB,
    createdAt: now,
    updatedAt: now,
  }

  await db.transaction('rw', db.fights, async () => {
    await db.fights.add(fight)
    await enforceSingleCardHighlight(input.eventId, fight.id, {
      isMainEvent: input.isMainEvent,
      isCoMainEvent: input.isCoMainEvent,
    })
  })

  return fight
}

export type UpdateFightInput = Partial<Omit<CreateFightInput, 'eventId'>>

export async function updateFight(id: string, changes: UpdateFightInput): Promise<void> {
  assertValidFightInput(changes)

  const existing = await db.fights.get(id)
  if (!existing) throw new Error('Luta não encontrada.')

  const patch: UpdateFightInput = { ...changes }
  if (patch.fighterAName !== undefined) patch.fighterAName = patch.fighterAName.trim()
  if (patch.fighterBName !== undefined) patch.fighterBName = patch.fighterBName.trim()

  await db.transaction('rw', db.fights, async () => {
    await db.fights.update(id, { ...patch, updatedAt: new Date().toISOString() })
    await enforceSingleCardHighlight(existing.eventId, id, {
      isMainEvent: changes.isMainEvent,
      isCoMainEvent: changes.isCoMainEvent,
    })
  })
}

export async function deleteFight(id: string): Promise<void> {
  await db.fights.delete(id)
}
