import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EVENT_STATUS_LABELS, EVENT_TYPE_LABELS } from '@/utils/mmaConstants'
import type { MmaEvent } from '@/types/event'

const eventFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do evento.').max(80, 'Máximo de 80 caracteres.'),
  date: z.string().min(1, 'Informe a data do evento.'),
  location: z.string().trim().max(80, 'Máximo de 80 caracteres.'),
  arena: z.string().trim().max(80, 'Máximo de 80 caracteres.'),
  type: z.enum(['PPV', 'FIGHT_NIGHT', 'SPECIAL']),
  status: z.enum(['DRAFT', 'OPEN_FOR_BETS', 'IN_PROGRESS', 'FINISHED']),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormDialogProps {
  event?: MmaEvent
  onClose: () => void
  onSave: (values: EventFormValues) => Promise<void>
}

export function EventFormDialog({ event, onClose, onSave }: EventFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event?.name ?? '',
      date: event?.date ? event.date.slice(0, 10) : '',
      location: event?.location ?? '',
      arena: event?.arena ?? '',
      type: event?.type ?? 'FIGHT_NIGHT',
      status: event?.status ?? 'DRAFT',
    },
  })

  async function onSubmit(values: EventFormValues) {
    await onSave(values)
    onClose()
  }

  return (
    <Modal title={event ? 'Editar evento' : 'Novo evento'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="event-name">
            Nome do evento
          </label>
          <input
            id="event-name"
            {...register('name')}
            placeholder="Ex: Fight Night 250"
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
          />
          {errors.name && <p className="mt-1 text-xs text-arena-red">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="event-date">
              Data
            </label>
            <input
              id="event-date"
              type="date"
              {...register('date')}
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            />
            {errors.date && <p className="mt-1 text-xs text-arena-red">{errors.date.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="event-type">
              Tipo
            </label>
            <select
              id="event-type"
              {...register('type')}
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="event-arena">
              Arena
            </label>
            <input
              id="event-arena"
              {...register('arena')}
              placeholder="Ex: Apex"
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="event-location">
              Local
            </label>
            <input
              id="event-location"
              {...register('location')}
              placeholder="Ex: Las Vegas, EUA"
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="event-status">
            Status
          </label>
          <select
            id="event-status"
            {...register('status')}
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
          >
            {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {event ? 'Salvar' : 'Criar evento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
