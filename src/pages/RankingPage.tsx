import { useEffect, useState } from 'react'
import { useProfileStore } from '@/store/profileStore'
import { useBetStore } from '@/store/betStore'
import { RankingTable } from '@/components/features/statistics/RankingTable'
import { buildRanking, sortRanking, RANKING_SORT_LABELS } from '@/utils/ranking'
import type { RankingSortKey } from '@/utils/ranking'

const SORT_KEYS: RankingSortKey[] = ['balance', 'profit', 'roi', 'wins']

export function RankingPage() {
  const profiles = useProfileStore((state) => state.profiles)
  const wallets = useProfileStore((state) => state.wallets)
  const bets = useBetStore((state) => state.bets)
  const loadBets = useBetStore((state) => state.loadBets)

  const [sortKey, setSortKey] = useState<RankingSortKey>('balance')

  useEffect(() => {
    loadBets()
  }, [loadBets])

  const entries = sortRanking(buildRanking(profiles, wallets, bets), sortKey)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ranking</h1>
        <p className="text-sm text-arena-text-muted">
          Classificação entre os jogadores por saldo, lucro, ROI e vitórias.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SORT_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              sortKey === key
                ? 'bg-arena-red text-white'
                : 'bg-arena-surface-hover text-arena-text-muted hover:text-arena-text'
            }`}
          >
            Ordenar por {RANKING_SORT_LABELS[key]}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-arena-text-muted">Nenhum perfil cadastrado ainda.</p>
      ) : (
        <RankingTable entries={entries} />
      )}
    </div>
  )
}
