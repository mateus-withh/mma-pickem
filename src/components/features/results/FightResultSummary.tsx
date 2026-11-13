import { Pencil, Trash2 } from 'lucide-react'
import type { Fight } from '@/types/fight'
import type { FightResult } from '@/types/fightResult'
import { Badge } from '@/components/ui/Badge'
import { FIGHT_OUTCOME_LABELS } from '@/utils/mmaConstants'

interface FightResultSummaryProps {
  fight: Fight
  result: FightResult
  onEdit: () => void
  onDelete: () => void
}

export function FightResultSummary({ fight, result, onEdit, onDelete }: FightResultSummaryProps) {
  const winnerLabel =
    result.outcome === 'FIGHTER_A'
      ? fight.fighterAName
      : result.outcome === 'FIGHTER_B'
        ? fight.fighterBName
        : FIGHT_OUTCOME_LABELS[result.outcome]

  const details = [result.method, result.round ? `Round ${result.round}` : null, result.time]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mt-2 rounded-lg border border-arena-border bg-arena-bg/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="green">Finalizada</Badge>
            <p className="text-sm font-semibold">{winnerLabel}</p>
          </div>
          <p className="mt-1 text-xs text-arena-text-faint">{details || 'Sem detalhes adicionais.'}</p>
          {result.notes && (
            <p className="mt-1 text-xs italic text-arena-text-faint">"{result.notes}"</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-arena-text-faint hover:bg-arena-surface-hover hover:text-arena-text"
            aria-label="Corrigir resultado"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-arena-text-faint hover:bg-arena-red/10 hover:text-arena-red"
            aria-label="Remover resultado"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
