import { create } from 'zustand'
import * as eventService from '@/services/eventService'
import * as fightService from '@/services/fightService'
import type { MmaEvent } from '@/types/event'
import type { Fight } from '@/types/fight'

interface EventState {
  events: MmaEvent[]
  fightsByEvent: Record<string, Fight[]>
  isLoading: boolean
  error: string | null

  loadEvents: () => Promise<void>
  loadFights: (eventId: string) => Promise<void>
  createEvent: (input: eventService.CreateEventInput) => Promise<MmaEvent>
  updateEvent: (id: string, changes: eventService.UpdateEventInput) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  createFight: (input: fightService.CreateFightInput) => Promise<void>
  updateFight: (id: string, eventId: string, changes: fightService.UpdateFightInput) => Promise<void>
  deleteFight: (id: string, eventId: string) => Promise<void>
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  fightsByEvent: {},
  isLoading: false,
  error: null,

  loadEvents: async () => {
    set({ isLoading: true, error: null })
    try {
      const events = await eventService.listEvents()
      set({ events })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro ao carregar eventos.' })
    } finally {
      set({ isLoading: false })
    }
  },

  loadFights: async (eventId) => {
    const fights = await fightService.listFightsByEvent(eventId)
    set((state) => ({ fightsByEvent: { ...state.fightsByEvent, [eventId]: fights } }))
  },

  createEvent: async (input) => {
    const event = await eventService.createEvent(input)
    await get().loadEvents()
    return event
  },

  updateEvent: async (id, changes) => {
    await eventService.updateEvent(id, changes)
    await get().loadEvents()
  },

  deleteEvent: async (id) => {
    await eventService.deleteEvent(id)
    await get().loadEvents()
    set((state) => {
      const next = { ...state.fightsByEvent }
      delete next[id]
      return { fightsByEvent: next }
    })
  },

  createFight: async (input) => {
    await fightService.createFight(input)
    await get().loadFights(input.eventId)
  },

  updateFight: async (id, eventId, changes) => {
    await fightService.updateFight(id, changes)
    await get().loadFights(eventId)
  },

  deleteFight: async (id, eventId) => {
    await fightService.deleteFight(id)
    await get().loadFights(eventId)
  },
}))
