import { useEffect } from 'react'
import { subscribeToChanges } from '@/lib/realtime'
import { useProfileStore } from '@/store/profileStore'
import { useBetStore } from '@/store/betStore'
import { useEventStore } from '@/store/eventStore'
import { useResultStore } from '@/store/resultStore'

/** Chame UMA vez, no componente raiz (App). Mantém a tela dos dois jogadores em sincronia. */
export function useRealtimeSync(): void {
  useEffect(() => {
    return subscribeToChanges(() => {
      void useProfileStore.getState().refresh()
      void useBetStore.getState().loadBets()

      const eventState = useEventStore.getState()
      void eventState.loadEvents()
      Object.keys(eventState.fightsByEvent).forEach((eventId) => void eventState.loadFights(eventId))

      const resultState = useResultStore.getState()
      Object.keys(resultState.resultsByFight).forEach((fightId) => void resultState.loadResult(fightId))
    })
  }, [])
}
