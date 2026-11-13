import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/profile'

const initialBalanceFormSchema = z.object({
  initialBalance: z.number().min(0, 'O saldo inicial não pode ser negativo.'),
})

type InitialBalanceFormValues = z.infer<typeof initialBalanceFormSchema>

interface InitialBalanceDialogProps {
  profile: Profile
  onClose: () => void
  onConfirm: (values: InitialBalanceFormValues) => Promise<void>
}

export function InitialBalanceDialog({ profile, onClose, onConfirm }: InitialBalanceDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InitialBalanceFormValues>({
    resolver: zodResolver(initialBalanceFormSchema),
    defaultValues: { initialBalance: profile.initialBalance },
  })

  async function onSubmit(values: InitialBalanceFormValues) {
    await onConfirm(values)
    onClose()
  }

  return (
    <Modal title={`Saldo inicial · ${profile.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            className="mb-1 block text-xs font-medium text-arena-text-muted"
            htmlFor="initial-balance"
          >
            Saldo inicial (UFC Points)
          </label>
          <input
            id="initial-balance"
            type="number"
            step="0.01"
            {...register('initialBalance', { valueAsNumber: true })}
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
          />
          {errors.initialBalance && (
            <p className="mt-1 text-xs text-arena-red">{errors.initialBalance.message}</p>
          )}
        </div>

        <p className="text-xs text-arena-text-faint">
          Configuração administrativa. Atualiza a transação INITIAL_BALANCE do perfil no histórico —
          o saldo continua sendo derivado das transações, nunca escrito diretamente.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
