import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Pencil, Plus, Trash2, ClipboardCheck } from 'lucide-react'
import { useEventStore } from '@/store/eventStore'
import { useBetStore } from '@/store/betStore'
import { useProfileStore } from '@/store/profileStore'
import { useResultStore } from '@/store/resultStore'
import { EventFormDialog } from '@/components/features/events/EventFormDialog'
import { FightCard } from '@/components/features/fights/FightCard'
import { FightFormDialog } from '@/components/features/fights/FightFormDialog'
import { FightBettingPanel } from '@/components/features/bets/FightBettingPanel'
import { ResultFormDialog } from '@/components/features/results/ResultFormDialog'
import { FightResultSummary } from '@/components/features/results/FightResultSummary'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ComingSoon } from '@/components/ui/ComingSoon'
import { EVENT_STATUS_LABELS, EVENT_STATUS_TONES, EVENT_TYPE_LABELS } from '@/utils/mmaConstants'
import { Swords } from 'lucide-react'
import type { Fight } from '@/types/fight'

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const events = useEventStore((state) => state.events)
  const fightsByEvent = useEventStore((state) => state.fightsByEvent)
  const loadEvents = useEventStore((state) => state.loadEvents)
  const loadFights = useEventStore((state) => state.loadFights)
  const updateEvent = useEventStore((state) => state.updateEvent)
  const deleteEvent = useEventStore((state) => state.deleteEvent)
  const createFight = useEventStore((state) => state.createFight)
  const updateFight = useEventStore((state) => state.updateFight)
  const deleteFight = useEventStore((state) => state.deleteFight)

  const bets = useBetStore((state) => state.bets)
  const loadBets = useBetStore((state) => state.loadBets)
  const placeBet = useBetStore((state) => state.placeBet)
  const cancelPendingBet = useBetStore((state) => state.cancelPendingBet)

  const resultsByFight = useResultStore((state) => state.resultsByFight)
  const loadResult = useResultStore((state) => state.loadResult)
  const registerResult = useResultStore((state) => state.registerResult)
  const deleteResult = useResultStore((state) => state.deleteResult)

  const profiles = useProfileStore((state) => state.profiles)
  const wallets = useProfileStore((state) => state.wallets)
  const activeProfiles = profiles.filter((profile) => profile.active)

  const [isEditingEvent, setIsEditingEvent] = useState(false)
  const [fightDialog, setFightDialog] = useState<{ mode: 'create' } | { mode: 'edit'; fight: Fight } | null>(
    null,
  )
  const [resultDialogFight, setResultDialogFight] = useState<Fight | null>(null)

  useEffect(() => {
    if (events.length === 0) loadEvents()
  }, [events.length, loadEvents])

  useEffect(() => {
    if (eventId) loadFights(eventId)
  }, [eventId, loadFights])

  useEffect(() => {
    loadBets()
  }, [loadBets])

  useEffect(() => {
    if (eventId) {
      const fightsForEvent = fightsByEvent[eventId] ?? []
      fightsForEvent.forEach((fight) => loadResult(fight.id))
    }
  }, [eventId, fightsByEvent, loadResult])

  const event = events.find((e) => e.id === eventId)
  const fights = eventId ? (fightsByEvent[eventId] ?? []) : []

  if (!event) {
    return (
      <div className="space-y-4">
        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-arena-text-muted hover:text-arena-text">
          <ArrowLeft size={15} /> Voltar para eventos
        </Link>
        <ComingSoon
          icon={Swords}
          title="Evento não encontrado"
          description="Esse evento pode ter sido removido. Volte para a lista de eventos."
          phase="Eventos"
        />
      </div>
    )
  }

  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  async function handleDeleteEvent() {
    if (!eventId) return
    if (!window.confirm(`Excluir o evento "${event?.name}" e todas as suas lutas?`)) return
    await deleteEvent(eventId)
    navigate('/events')
  }

  function handleDeleteFight(fight: Fight) {
    if (!eventId) return
    if (!window.confirm(`Excluir a luta ${fight.fighterAName} vs ${fight.fighterBName}?`)) return
    deleteFight(fight.id, eventId)
  }

  function handleDeleteResult(fight: Fight) {
    if (
      !window.confirm(
        `Remover o resultado de ${fight.fighterAName} vs ${fight.fighterBName}? As apostas voltam a ficar pendentes.`,
      )
    ) {
      return
    }
    deleteResult(fight.id)
  }

  return (
    <div className="space-y-6">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-sm text-arena-text-muted hover:text-arena-text"
      >
        <ArrowLeft size={15} /> Voltar para eventos
      </Link>

      <div className="rounded-2xl border border-arena-border bg-arena-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-arena-text-faint">
              {EVENT_TYPE_LABELS[event.type]}
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight">{event.name}</h1>
          </div>
          <Badge tone={EVENT_STATUS_TONES[event.status]}>{EVENT_STATUS_LABELS[event.status]}</Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-arena-text-muted">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-arena-text-faint" />
            {formattedDate}
          </div>
          {(event.arena || event.location) && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-arena-text-faint" />
              {[event.arena, event.location].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2 border-t border-arena-border pt-4">
          <Button variant="secondary" onClick={() => setIsEditingEvent(true)}>
            <Pencil size={14} /> Editar evento
          </Button>
          <Button variant="ghost" onClick={handleDeleteEvent}>
            <Trash2 size={14} /> Excluir evento
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-arena-text-faint">
          Lutas ({fights.length})
        </h2>
        <Button variant="primary" onClick={() => setFightDialog({ mode: 'create' })}>
          <Plus size={16} /> Adicionar luta
        </Button>
      </div>

      {fights.length === 0 ? (
        <ComingSoon
          icon={Swords}
          title="Nenhuma luta cadastrada"
          description='Clique em "Adicionar luta" para cadastrar o confronto, a categoria de peso e as odds americanas.'
          phase="Fase 3 · Eventos e Lutas"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {fights.map((fight) => {
            const result = resultsByFight[fight.id]

            return (
              <div key={fight.id}>
                <FightCard
                  fight={fight}
                  onEdit={() => setFightDialog({ mode: 'edit', fight })}
                  onDelete={() => handleDeleteFight(fight)}
                />

                {result ? (
                  <FightResultSummary
                    fight={fight}
                    result={result}
                    onEdit={() => setResultDialogFight(fight)}
                    onDelete={() => handleDeleteResult(fight)}
                  />
                ) : (
                  <Button
                    variant="secondary"
                    className="mt-2 w-full"
                    onClick={() => setResultDialogFight(fight)}
                  >
                    <ClipboardCheck size={14} /> Registrar resultado
                  </Button>
                )}

                <FightBettingPanel
                  fight={fight}
                  profiles={activeProfiles}
                  wallets={wallets}
                  betsForFight={bets.filter((bet) => bet.fightId === fight.id)}
                  isFinished={Boolean(result)}
                  onPlaceBet={(profileId, selection, stake) =>
                    placeBet({ profileId, fight, selection, stake })
                  }
                  onCancelBet={(betId) => cancelPendingBet(betId)}
                />
              </div>
            )
          })}
        </div>
      )}

      {isEditingEvent && (
        <EventFormDialog
          event={event}
          onClose={() => setIsEditingEvent(false)}
          onSave={(values) => updateEvent(event.id, values)}
        />
      )}

      {fightDialog?.mode === 'create' && eventId && (
        <FightFormDialog
          defaultCardPosition={fights.length + 1}
          onClose={() => setFightDialog(null)}
          onSave={(values) => createFight({ ...values, eventId })}
        />
      )}

      {fightDialog?.mode === 'edit' && eventId && (
        <FightFormDialog
          fight={fightDialog.fight}
          defaultCardPosition={fightDialog.fight.cardPosition}
          onClose={() => setFightDialog(null)}
          onSave={(values) => updateFight(fightDialog.fight.id, eventId, values)}
        />
      )}

      {resultDialogFight && eventId && (
        <ResultFormDialog
          fight={resultDialogFight}
          existingResult={resultsByFight[resultDialogFight.id]}
          onClose={() => setResultDialogFight(null)}
          onSave={(values) =>
            registerResult({
              fightId: resultDialogFight.id,
              eventId,
              ...values,
            })
          }
        />
      )}
    </div>
  )
}
