export type EventType = 'PPV' | 'FIGHT_NIGHT' | 'SPECIAL'

export type EventStatus = 'DRAFT' | 'OPEN_FOR_BETS' | 'IN_PROGRESS' | 'FINISHED'

/**
 * Chamado de MmaEvent (em vez de Event) para não colidir com o tipo
 * global `Event` do DOM.
 */
export interface MmaEvent {
  id: string
  name: string
  /** Data/hora em formato ISO. */
  date: string
  location: string
  arena: string
  type: EventType
  status: EventStatus
  createdAt: string
  updatedAt: string
}
