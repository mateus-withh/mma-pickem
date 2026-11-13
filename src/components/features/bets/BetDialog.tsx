import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { calculateProfit, calculatePayout, formatAmericanOdd } from '@/utils/odds'
import { formatUfcPoints } from '@/utils/currency'
import type { Fight } from '@/types/fight'
import type { Profile } from '@/types/profile'
import type { BetSelection } from '@/types/bet'

interface BetFormValues {
  selection: BetSelection
  stake: number
}

interface BetDialogProps {
  fight: Fight
  profile: Profile
  availableBalance: number
  onClose: () => void
  onConfirm: (values: BetFormValues) => Promise<void>
}

export function BetDialog({ fight, profile, availableBalance, onClose, onConfirm }: BetDialogProps) {
  const schema = useMemo(
    () =>
      z.object({
        selection: z.enum(['FIGHTER_A', 'FIGHTER_B']),
        stake: z
          .number({ message: 'Informe o valor da aposta.' })
          .positive('O valor apostado deve ser maior que zero.')
          .max(availableBalance, `Saldo disponível: ${formatUfcPoints(availableBalance)}.`),
      }),
    [availableBalance],
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { selection: 'FIGHTER_A', stake: 0 },
  })

  const selection = watch('selection')
  const stake = watch('stake')

  const odd = selection === 'FIGHTER_A' ? fight.oddFighterA : fight.oddFighterB
  const isStakeValid = typeof stake === 'number' && stake > 0 && stake <= availableBalance
  const potentialProfit = isStakeValid ? calculateProfit(stake, odd) : 0
  const potentialPayout = isStakeValid ? calculatePayout(stake, odd) : 0

  async function onSubmit(values: BetFormValues) {
    await onConfirm(values)
    onClose()
  }

  return (
    <Modal title={`Apostar · ${profile.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-arena-text-muted">
            Escolha o lutador
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-arena-border bg-arena-bg p-3 text-center has-[:checked]:border-arena-red has-[:checked]:bg-arena-red/10">
              <input type="radio" value="FIGHTER_A" {...register('selection')} className="sr-only" />
              <span className="text-sm font-semibold">{fight.fighterAName}</span>
              <span className="font-mono text-sm text-arena-blue">
                {formatAmericanOdd(fight.oddFighterA)}
              </span>
            </label>
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-arena-border bg-arena-bg p-3 text-center has-[:checked]:border-arena-red has-[:checked]:bg-arena-red/10">
              <input type="radio" value="FIGHTER_B" {...register('selection')} className="sr-only" />
              <span className="text-sm font-semibold">{fight.fighterBName}</span>
              <span className="font-mono text-sm text-arena-blue">
                {formatAmericanOdd(fight.oddFighterB)}
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="bet-stake">
            Valor da aposta (UFC Points)
          </label>
          <input
            id="bet-stake"
            type="number"
            step="0.01"
            {...register('stake', { valueAsNumber: true })}
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
          />
          {errors.stake && <p className="mt-1 text-xs text-arena-red">{errors.stake.message}</p>}
          <p className="mt-1 text-xs text-arena-text-faint">
            Disponível: {formatUfcPoints(availableBalance)}
          </p>
        </div>

        <div className="rounded-lg border border-arena-border bg-arena-bg/60 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-arena-text-faint">Aposta</span>
            <span className="font-mono">{formatUfcPoints(isStakeValid ? stake : 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-arena-text-faint">Odd</span>
            <span className="font-mono">{formatAmericanOdd(odd)}</span>
          </div>
          <div className="mt-1.5 flex justify-between border-t border-arena-border pt-1.5">
            <span className="text-arena-text-faint">Lucro potencial</span>
            <span className="font-mono text-arena-green">{formatUfcPoints(potentialProfit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-arena-text-faint">Retorno potencial</span>
            <span className="font-mono font-semibold">{formatUfcPoints(potentialPayout)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || !isStakeValid}>
            Confirmar aposta
          </Button>
        </div>
      </form>
    </Modal>
  )
}
