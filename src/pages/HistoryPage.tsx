import { useEffect } from 'react'
import { History } from 'lucide-react'
import { useEventStore } from '@/store/eventStore'
import { useBetStore } from '@/store/betStore'
import { useProfileStore } from '@/store/profileStore'
import { HistoryEventCard } from '@/components/features/history/HistoryEventCard'
import { ComingSoon } from '@/components/ui/ComingSoon'

export function HistoryPage() {
  const events = useEventStore((state) => state.events)
  const fightsByEvent = useEventStore((state) => state.fightsByEvent)
  const loadEvents = useEventStore((state) => state.loadEvents)
  const loadFights = useEventStore((state) => state.loadFights)

  const bets = useBetStore((state) => state.bets)
  const loadBets = useBetStore((state) => state.loadBets)

  const profiles = useProfileStore((state) => state.profiles)
  const activeProfiles = profiles.filter((profile) => profile.active)

  useEffect(() => {
    loadEvents()
    loadBets()
  }, [loadEvents, loadBets])

  useEffect(() => {
    events.forEach((event) => {
      if (!fightsByEvent[event.id]) loadFights(event.id)
    })
  }, [events, fightsByEvent, loadFights])

  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
        <p className="text-sm text-arena-text-muted">
          Todos os eventos, odds usadas, apostas e resultados.
        </p>
      </div>

      {sortedEvents.length === 0 ? (
        <ComingSoon
          icon={History}
          title="Nenhum evento no histórico ainda"
          description='Cadastre um evento na aba "Eventos" para vê-lo aparecer aqui.'
          phase="Eventos"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map((event) => (
            <HistoryEventCard
              key={event.id}
              event={event}
              fights={fightsByEvent[event.id] ?? []}
              eventBets={bets.filter((bet) => bet.eventId === event.id)}
              profiles={activeProfiles}
            />
          ))}
        </div>
      )}
    </div>
  )
}
