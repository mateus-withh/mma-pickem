import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/profile'

const adjustmentFormSchema = z.object({
  amount: z.number().refine((value) => value !== 0, 'O valor não pode ser zero.'),
  reason: z.string().trim().min(3, 'Descreva o motivo (mínimo 3 caracteres).'),
})

type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>

interface ManualAdjustmentDialogProps {
  profile: Profile
  onClose: () => void
  onConfirm: (values: AdjustmentFormValues) => Promise<void>
}

export function ManualAdjustmentDialog({ profile, onClose, onConfirm }: ManualAdjustmentDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: { amount: 0, reason: '' },
  })

  async function onSubmit(values: AdjustmentFormValues) {
    await onConfirm(values)
    onClose()
  }

  return (
    <Modal title={`Ajuste manual · ${profile.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="adjustment-amount">
            Valor (use negativo para remover pontos)
          </label>
          <input
            id="adjustment-amount"
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            placeholder="Ex: 50 ou -10"
          />
          {errors.amount && <p className="mt-1 text-xs text-arena-red">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="adjustment-reason">
            Motivo
          </label>
          <input
            id="adjustment-reason"
            {...register('reason')}
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            placeholder="Ex: Prêmio especial"
          />
          {errors.reason && <p className="mt-1 text-xs text-arena-red">{errors.reason.message}</p>}
        </div>

        <p className="text-xs text-arena-text-faint">
          Este ajuste cria uma transação MANUAL_ADJUSTMENT no histórico — o saldo nunca é editado diretamente.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            Confirmar ajuste
          </Button>
        </div>
      </form>
    </Modal>
  )
}
