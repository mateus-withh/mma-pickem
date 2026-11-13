import { useEffect, useState } from 'react'
import { Plus, Swords } from 'lucide-react'
import { useEventStore } from '@/store/eventStore'
import { EventCard } from '@/components/features/events/EventCard'
import { EventFormDialog } from '@/components/features/events/EventFormDialog'
import { Button } from '@/components/ui/Button'
import { ComingSoon } from '@/components/ui/ComingSoon'

export function EventsPage() {
  const events = useEventStore((state) => state.events)
  const fightsByEvent = useEventStore((state) => state.fightsByEvent)
  const isLoading = useEventStore((state) => state.isLoading)
  const loadEvents = useEventStore((state) => state.loadEvents)
  const loadFights = useEventStore((state) => state.loadFights)
  const createEvent = useEventStore((state) => state.createEvent)

  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    events.forEach((event) => {
      if (!fightsByEvent[event.id]) loadFights(event.id)
    })
  }, [events, fightsByEvent, loadFights])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eventos</h1>
          <p className="text-sm text-arena-text-muted">Cadastre eventos, lutas e odds americanas.</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreating(true)}>
          <Plus size={16} /> Novo evento
        </Button>
      </div>

      {isLoading && events.length === 0 ? (
        <p className="text-sm text-arena-text-muted">Carregando eventos...</p>
      ) : events.length === 0 ? (
        <ComingSoon
          icon={Swords}
          title="Nenhum evento cadastrado ainda"
          description='Clique em "Novo evento" para criar seu primeiro card de MMA e começar a adicionar lutas e odds.'
          phase="Fase 3 · Eventos e Lutas"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} fightCount={(fightsByEvent[event.id] ?? []).length} />
          ))}
        </div>
      )}

      {isCreating && (
        <EventFormDialog
          onClose={() => setIsCreating(false)}
          onSave={async (values) => {
            await createEvent(values)
          }}
        />
      )}
    </div>
  )
}
