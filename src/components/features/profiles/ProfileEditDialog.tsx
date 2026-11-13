import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/profile'

const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome.').max(40, 'Máximo de 40 caracteres.'),
  active: z.boolean(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileEditDialogProps {
  profile: Profile
  onClose: () => void
  onSave: (changes: ProfileFormValues) => Promise<void>
}

export function ProfileEditDialog({ profile, onClose, onSave }: ProfileEditDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: profile.name, active: profile.active },
  })

  async function onSubmit(values: ProfileFormValues) {
    await onSave(values)
    onClose()
  }

  return (
    <Modal title={`Editar ${profile.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-arena-text-muted" htmlFor="profile-name">
            Nome
          </label>
          <input
            id="profile-name"
            {...register('name')}
            className="w-full rounded-lg border border-arena-border bg-arena-bg px-3 py-2 text-sm outline-none focus:border-arena-red"
          />
          {errors.name && <p className="mt-1 text-xs text-arena-red">{errors.name.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...register('active')}
            className="h-4 w-4 rounded border-arena-border accent-arena-red"
          />
          Perfil ativo
        </label>

        <p className="text-xs text-arena-text-faint">
          Avatar poderá ser configurado em uma atualização futura.
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
