import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { Fight } from '@/types/fight'
import type { FightResult } from '@/types/fightResult'

const resultFormSchema = z.object({
  outcome: z.enum(['FIGHTER_A', 'FIGHTER_B', 'DRAW', 'NO_CONTEST']),
  method: z.string().trim().max(60, 'Máximo de 60 caracteres.').optional(),
  round: z
    .string()
    .trim()
    .regex(/^\d*$/, 'Informe apenas números.')
    .optional(),
  time: z.string().trim().max(20, 'Máximo de 20 caracteres.').optional(),
  notes: z.string().trim().max(300, 'Máximo de 300 caracteres.').optional(),
})

type ResultFormValues = z.infer<typeof resultFormSchema>

export interface ResultFormSubmitValues {
  outcome: ResultFormValues['outcome']
  method?: string
  round?: number
  time?: string
  notes?: string
}

interface ResultFormDialogProps {
  fight: Fight
  existingResult?: FightResult
  onClose: () => void
  onSave: (values: ResultFormSubmitValues) => Promise<void>
}

export function ResultFormDialog({ fight, existingResult, onClose, onSave }: ResultFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResultFormValues>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      outcome: existingResult?.outcome ?? 'FIGHTER_A',
      method: existingResult?.method ?? '',
      round: existingResult?.round ? String(existingResult.round) : '',
      time: existingResult?.time ?? '',
      notes: existingResult?.notes ?? '',
    },
  })

  async function onSubmit(values: ResultFormValues) {
    await onSave({
      outcome: values.outcome,
      method: values.method,
      round: values.round ? Number(values.round) : undefined,
      time: values.time,
      notes: values.notes,
    })
    onClose()
  }

  return (
    <Modal title={existingResult ? 'Corrigir resultado' : 'Registrar resultado'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {existingResult && (
          <p className="rounded-lg border border-arena-gold/30 bg-arena-gold/10 p-3 text-xs text-arena-gold">
            Esta luta já tem um resultado liquidado. Salvar aqui reverte a liquidação anterior por
            completo (as apostas voltam para pendente) e aplica o novo resultado do zero — nada fica
            duplicado.
          </p>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="outcome">
            Vencedor
          </label>
          <select
            id="outcome"
            {...register('outcome')}
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
          >
            <option value="FIGHTER_A">{fight.fighterAName}</option>
            <option value="FIGHTER_B">{fight.fighterBName}</option>
            <option value="DRAW">Empate</option>
            <option value="NO_CONTEST">No Contest</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="method">
              Método (opcional)
            </label>
            <input
              id="method"
              {...register('method')}
              placeholder="Ex: Nocaute, Finalização..."
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="round">
              Round (opcional)
            </label>
            <input
              id="round"
              type="number"
              min={1}
              max={fight.rounds}
              {...register('round')}
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            />
            {errors.round && <p className="mt-1 text-xs text-arena-red">{errors.round.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="time">
            Tempo (opcional)
          </label>
          <input
            id="time"
            {...register('time')}
            placeholder="Ex: 3:24"
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="notes">
            Observações (opcional)
          </label>
          <textarea
            id="notes"
            rows={2}
            {...register('notes')}
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {existingResult ? 'Salvar correção' : 'Registrar resultado e liquidar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
