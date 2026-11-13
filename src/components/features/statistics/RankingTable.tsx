import type { RankingEntry } from '@/utils/ranking'
import { medalForPosition } from '@/utils/ranking'
import { formatUfcPoints, formatPercent } from '@/utils/currency'
import { Badge } from '@/components/ui/Badge'

interface RankingTableProps {
  entries: RankingEntry[]
  /** Modo compacto: esconde ROI e Vitórias — usado na prévia do Dashboard. */
  compact?: boolean
}

export function RankingTable({ entries, compact = false }: RankingTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-arena-border bg-arena-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-arena-border text-left text-xs text-arena-text-faint">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Jogador</th>
            <th className="px-4 py-3 text-right font-medium">Saldo</th>
            <th className="px-4 py-3 text-right font-medium">Lucro/Prejuízo</th>
            {!compact && <th className="px-4 py-3 text-right font-medium">ROI</th>}
            {!compact && <th className="px-4 py-3 text-right font-medium">Vitórias</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const position = index + 1
            const medal = medalForPosition(position)
            const profit = entry.wallet.profit
            const profitClass =
              profit > 0 ? 'text-arena-green' : profit < 0 ? 'text-arena-red' : 'text-arena-text-faint'

            return (
              <tr key={entry.profile.id} className="border-b border-arena-border last:border-0">
                <td className="px-4 py-3 font-mono text-arena-text-faint">
                  {medal ? <span className="text-base">{medal}</span> : position}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.profile.name}</span>
                    {!entry.profile.active && <Badge tone="muted">Inativo</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatUfcPoints(entry.wallet.totalBalance)}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${profitClass}`}>
                  {formatUfcPoints(profit, { showSign: true })}
                </td>
                {!compact && (
                  <td className="px-4 py-3 text-right font-mono">{formatPercent(entry.wallet.roi)}</td>
                )}
                {!compact && <td className="px-4 py-3 text-right font-mono">{entry.winsCount}</td>}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
