import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import type { Profile } from '@/types/profile'
import type { WalletSummary } from '@/types/wallet'
import { formatUfcPoints } from '@/utils/currency'
import { Badge } from '@/components/ui/Badge'

interface ProfileCardProps {
  profile: Profile
  wallet?: WalletSummary
  actions?: ReactNode
  /** Quando informado, mostra um link "Ver estatísticas completas" no rodapé do card. */
  statsHref?: string
}

export function ProfileCard({ profile, wallet, actions, statsHref }: ProfileCardProps) {
  const profit = wallet?.profit ?? 0
  const profitTone = profit > 0 ? 'green' : profit < 0 ? 'red' : 'muted'

  return (
    <div className="rounded-2xl border border-arena-border bg-arena-surface p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-arena-surface-hover text-arena-text-muted">
            <User size={20} />
          </div>
          <div>
            <p className="font-semibold leading-tight">{profile.name}</p>
            <Badge tone={profile.active ? 'green' : 'muted'}>
              {profile.active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>
        {actions}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-arena-bg/60 py-2">
          <p className="text-[11px] text-arena-text-faint">Saldo</p>
          <p className="text-sm font-semibold">
            {formatUfcPoints(wallet?.totalBalance ?? profile.initialBalance)}
          </p>
        </div>
        <div className="rounded-lg bg-arena-bg/60 py-2">
          <p className="text-[11px] text-arena-text-faint">Disponível</p>
          <p className="text-sm font-semibold">
            {formatUfcPoints(wallet?.availableBalance ?? profile.initialBalance)}
          </p>
        </div>
        <div className="rounded-lg bg-arena-bg/60 py-2">
          <p className="text-[11px] text-arena-text-faint">Pendente</p>
          <p className="text-sm font-semibold">{formatUfcPoints(wallet?.pendingPoints ?? 0)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-arena-bg/60 px-3 py-2">
        <span className="text-xs text-arena-text-faint">Lucro/prejuízo</span>
        <Badge tone={profitTone}>{formatUfcPoints(profit, { showSign: true })}</Badge>
      </div>

      {statsHref && (
        <Link
          to={statsHref}
          className="mt-3 block rounded-lg py-1.5 text-center text-xs font-medium text-arena-red hover:underline"
        >
          Ver estatísticas completas
        </Link>
      )}
    </div>
  )
}
