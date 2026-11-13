import { useState } from 'react'
import { Settings as SettingsIcon, Pencil, Wallet, Coins } from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import { ProfileCard } from '@/components/features/profiles/ProfileCard'
import { ProfileEditDialog } from '@/components/features/profiles/ProfileEditDialog'
import { ManualAdjustmentDialog } from '@/components/features/wallet/ManualAdjustmentDialog'
import { InitialBalanceDialog } from '@/components/features/settings/InitialBalanceDialog'
import { BackupSection } from '@/components/features/settings/BackupSection'
import { TransactionHistoryList } from '@/components/features/wallet/TransactionHistoryList'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/profile'

type DialogState =
  | { type: 'edit'; profile: Profile }
  | { type: 'adjust'; profile: Profile }
  | { type: 'initial-balance'; profile: Profile }
  | null

export function SettingsPage() {
  const profiles = useProfileStore((state) => state.profiles)
  const wallets = useProfileStore((state) => state.wallets)
  const transactions = useProfileStore((state) => state.transactions)
  const isLoading = useProfileStore((state) => state.isLoading)
  const updateProfile = useProfileStore((state) => state.updateProfile)
  const adjustBalance = useProfileStore((state) => state.adjustBalance)
  const setInitialBalance = useProfileStore((state) => state.setInitialBalance)

  const [dialog, setDialog] = useState<DialogState>(null)
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-arena-text-muted">
          Perfis, ajustes manuais de UFC Points e backup dos dados.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-arena-text-faint">Perfis</h2>

        {isLoading && profiles.length === 0 ? (
          <p className="text-sm text-arena-text-muted">Carregando perfis...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {profiles.map((profile) => (
              <div key={profile.id} className="space-y-2">
                <ProfileCard
                  profile={profile}
                  wallet={wallets[profile.id]}
                  actions={
                    <button
                      onClick={() => setDialog({ type: 'edit', profile })}
                      className="rounded-lg p-1.5 text-arena-text-faint hover:bg-arena-surface-hover hover:text-arena-text"
                      aria-label="Editar perfil"
                    >
                      <Pencil size={16} />
                    </button>
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setDialog({ type: 'adjust', profile })}>
                    <Coins size={14} /> Ajuste manual
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setDialog({ type: 'initial-balance', profile })}
                  >
                    <SettingsIcon size={14} /> Saldo inicial
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setExpandedProfileId((current) => (current === profile.id ? null : profile.id))
                    }
                  >
                    <Wallet size={14} />
                    {expandedProfileId === profile.id ? 'Ocultar histórico' : 'Ver histórico'}
                  </Button>
                </div>

                {expandedProfileId === profile.id && (
                  <div className="rounded-xl border border-arena-border bg-arena-surface/60 p-4">
                    <TransactionHistoryList
                      transactions={transactions.filter((t) => t.profileId === profile.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-arena-text-faint">Backup</h2>
        <BackupSection />
      </section>

      {dialog?.type === 'edit' && (
        <ProfileEditDialog
          profile={dialog.profile}
          onClose={() => setDialog(null)}
          onSave={(values) => updateProfile(dialog.profile.id, values)}
        />
      )}

      {dialog?.type === 'adjust' && (
        <ManualAdjustmentDialog
          profile={dialog.profile}
          onClose={() => setDialog(null)}
          onConfirm={(values) => adjustBalance(dialog.profile.id, values.amount, values.reason)}
        />
      )}

      {dialog?.type === 'initial-balance' && (
        <InitialBalanceDialog
          profile={dialog.profile}
          onClose={() => setDialog(null)}
          onConfirm={(values) => setInitialBalance(dialog.profile.id, values.initialBalance)}
        />
      )}
    </div>
  )
}
