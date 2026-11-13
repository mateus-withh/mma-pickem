import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import { useBetStore } from '@/store/betStore'
import { formatUfcPoints, formatPercent, formatPlainPercent } from '@/utils/currency'
import { formatAmericanOdd } from '@/utils/odds'
import { computeProfileStatistics } from '@/utils/statistics'
import { Badge } from '@/components/ui/Badge'
import { ComingSoon } from '@/components/ui/ComingSoon'

interface StatBoxProps {
  label: string
  value: string
  tone?: 'green' | 'red'
}

function StatBox({ label, value, tone }: StatBoxProps) {
  return (
    <div className="rounded-xl border border-arena-border bg-arena-surface p-4">
      <p className="text-xs text-arena-text-faint">{label}</p>
      <p
        className={`mt-1 font-mono text-lg font-semibold ${
          tone === 'green' ? 'text-arena-green' : tone === 'red' ? 'text-arena-red' : 'text-arena-text'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export function ProfilePage() {
  const { profileId } = useParams<{ profileId: string }>()

  const profiles = useProfileStore((state) => state.profiles)
  const wallets = useProfileStore((state) => state.wallets)

  const bets = useBetStore((state) => state.bets)
  const loadBets = useBetStore((state) => state.loadBets)

  useEffect(() => {
    loadBets()
  }, [loadBets])

  const profile = profiles.find((p) => p.id === profileId)

  if (!profile) {
    return (
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-arena-text-muted hover:text-arena-text"
        >
          <ArrowLeft size={15} /> Voltar ao Dashboard
        </Link>
        <ComingSoon
          icon={User}
          title="Perfil não encontrado"
          description="Esse perfil pode ter sido removido."
          phase="Perfis"
        />
      </div>
    )
  }

  const wallet = wallets[profile.id]
  const stats = wallet ? computeProfileStatistics(profile.id, bets, wallet) : null

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-arena-text-muted hover:text-arena-text"
      >
        <ArrowLeft size={15} /> Voltar ao Dashboard
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-arena-surface-hover text-arena-text-muted">
          <User size={26} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
          <Badge tone={profile.active ? 'green' : 'muted'}>{profile.active ? 'Ativo' : 'Inativo'}</Badge>
        </div>
      </div>

      {wallet && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-arena-text-faint">Carteira</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Saldo" value={formatUfcPoints(wallet.totalBalance)} />
            <StatBox label="Disponível" value={formatUfcPoints(wallet.availableBalance)} />
            <StatBox label="Pendente" value={formatUfcPoints(wallet.pendingPoints)} />
          </div>
        </section>
      )}

      {stats && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-arena-text-faint">
            Estatísticas
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatBox label="Total de apostas" value={String(stats.totalBets)} />
            <StatBox label="Vitórias" value={String(stats.wins)} tone="green" />
            <StatBox label="Derrotas" value={String(stats.losses)} tone="red" />
            <StatBox label="Apostas anuladas" value={String(stats.voided)} />
            <StatBox label="Taxa de acerto" value={formatPlainPercent(stats.winRate)} />
            <StatBox label="ROI" value={formatPercent(stats.roi)} />
            <StatBox label="Total apostado" value={formatUfcPoints(stats.totalWagered)} />
            <StatBox label="Total retornado" value={formatUfcPoints(stats.totalReturned)} />
            <StatBox
              label="Lucro/Prejuízo"
              value={formatUfcPoints(stats.profit, { showSign: true })}
              tone={stats.profit > 0 ? 'green' : stats.profit < 0 ? 'red' : undefined}
            />
            <StatBox
              label="Maior odd vencida"
              value={stats.biggestWinningOdd !== null ? formatAmericanOdd(stats.biggestWinningOdd) : '—'}
            />
            <StatBox
              label="Maior lucro em uma aposta"
              value={
                stats.biggestSingleBetProfit !== null
                  ? formatUfcPoints(stats.biggestSingleBetProfit)
                  : '—'
              }
            />
            <StatBox label="Maior sequência de vitórias" value={String(stats.longestWinStreak)} />
            <StatBox label="Maior sequência de derrotas" value={String(stats.longestLossStreak)} />
          </div>
        </section>
      )}
    </div>
  )
}
