import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { WEIGHT_CLASSES } from '@/utils/mmaConstants'
import type { Fight } from '@/types/fight'

const oddSchema = z
  .number({ message: 'Informe uma odd válida.' })
  .int('A odd deve ser um número inteiro (ex: -150, +130).')
  .refine((value) => value !== 0, 'A odd não pode ser zero.')
  .refine((value) => Math.abs(value) >= 100, 'Odds americanas usam no mínimo 100 (ex: -150, +130).')

const fightFormSchema = z
  .object({
    fighterAName: z.string().trim().min(1, 'Informe o nome do Lutador A.').max(60),
    fighterBName: z.string().trim().min(1, 'Informe o nome do Lutador B.').max(60),
    weightClass: z.string().min(1, 'Selecione a categoria de peso.'),
    rounds: z.union([z.literal(3), z.literal(5)]),
    cardPosition: z.number().int().min(1, 'A posição deve ser 1 ou maior.'),
    isMainEvent: z.boolean(),
    isCoMainEvent: z.boolean(),
    isTitleFight: z.boolean(),
    oddFighterA: oddSchema,
    oddFighterB: oddSchema,
  })
  .refine((data) => data.fighterAName.trim().toLowerCase() !== data.fighterBName.trim().toLowerCase(), {
    message: 'Lutador A e Lutador B não podem ser o mesmo lutador.',
    path: ['fighterBName'],
  })

type FightFormValues = z.infer<typeof fightFormSchema>

interface FightFormDialogProps {
  fight?: Fight
  defaultCardPosition: number
  onClose: () => void
  onSave: (values: FightFormValues) => Promise<void>
}

export function FightFormDialog({ fight, defaultCardPosition, onClose, onSave }: FightFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FightFormValues>({
    resolver: zodResolver(fightFormSchema),
    defaultValues: {
      fighterAName: fight?.fighterAName ?? '',
      fighterBName: fight?.fighterBName ?? '',
      weightClass: fight?.weightClass ?? WEIGHT_CLASSES[4],
      rounds: fight?.rounds ?? 3,
      cardPosition: fight?.cardPosition ?? defaultCardPosition,
      isMainEvent: fight?.isMainEvent ?? false,
      isCoMainEvent: fight?.isCoMainEvent ?? false,
      isTitleFight: fight?.isTitleFight ?? false,
      oddFighterA: fight?.oddFighterA ?? -150,
      oddFighterB: fight?.oddFighterB ?? 130,
    },
  })

  async function onSubmit(values: FightFormValues) {
    await onSave(values)
    onClose()
  }

  return (
    <Modal title={fight ? 'Editar luta' : 'Nova luta'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="fighter-a">
              Lutador A
            </label>
            <input
              id="fighter-a"
              {...register('fighterAName')}
              placeholder="Ex: Ilia Topuria"
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            />
            {errors.fighterAName && (
              <p className="mt-1 text-xs text-arena-red">{errors.fighterAName.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="fighter-b">
              Lutador B
            </label>
            <input
              id="fighter-b"
              {...register('fighterBName')}
              placeholder="Ex: Justin Gaethje"
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            />
            {errors.fighterBName && (
              <p className="mt-1 text-xs text-arena-red">{errors.fighterBName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="odd-a">
              Odd Lutador A
            </label>
            <input
              id="odd-a"
              type="number"
              step="1"
              {...register('oddFighterA', { valueAsNumber: true })}
              placeholder="-150"
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm font-mono outline-none focus:border-arena-red"
            />
            {errors.oddFighterA && (
              <p className="mt-1 text-xs text-arena-red">{errors.oddFighterA.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="odd-b">
              Odd Lutador B
            </label>
            <input
              id="odd-b"
              type="number"
              step="1"
              {...register('oddFighterB', { valueAsNumber: true })}
              placeholder="+130"
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm font-mono outline-none focus:border-arena-red"
            />
            {errors.oddFighterB && (
              <p className="mt-1 text-xs text-arena-red">{errors.oddFighterB.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label
              className="mb-1 block text-xs font-medium text-arena-text-muted"
              htmlFor="weight-class"
            >
              Categoria de peso
            </label>
            <select
              id="weight-class"
              {...register('weightClass')}
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            >
              {WEIGHT_CLASSES.map((weightClass) => (
                <option key={weightClass} value={weightClass}>
                  {weightClass}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="rounds">
              Rounds
            </label>
            <select
              id="rounds"
              {...register('rounds', { valueAsNumber: true })}
              className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="card-position">
            Posição no card (1 = abertura)
          </label>
          <input
            id="card-position"
            type="number"
            step="1"
            min={1}
            {...register('cardPosition', { valueAsNumber: true })}
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
          />
          {errors.cardPosition && (
            <p className="mt-1 text-xs text-arena-red">{errors.cardPosition.message}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isMainEvent')}
              className="h-4 w-4 rounded border-arena-border accent-arena-red"
            />
            Main Event
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isCoMainEvent')}
              className="h-4 w-4 rounded border-arena-border accent-arena-red"
            />
            Co-Main Event
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isTitleFight')}
              className="h-4 w-4 rounded border-arena-border accent-arena-red"
            />
            Vale cinturão
          </label>
        </div>

        <p className="text-xs text-arena-text-faint">
          Marcar Main Event ou Co-Main Event desmarca automaticamente essa marcação de outra luta do
          mesmo evento.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {fight ? 'Salvar' : 'Adicionar luta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
