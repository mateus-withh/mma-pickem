import { Pencil, Trash2, Crown, Star } from 'lucide-react'
import type { Fight } from '@/types/fight'
import { Badge } from '@/components/ui/Badge'
import { formatAmericanOdd } from '@/utils/odds'

interface FightCardProps {
  fight: Fight
  onEdit: () => void
  onDelete: () => void
}

export function FightCard({ fight, onEdit, onDelete }: FightCardProps) {
  return (
    <div className="rounded-2xl border border-arena-border bg-arena-surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        {fight.isMainEvent && (
          <Badge tone="red">
            <Crown size={11} className="mr-1 inline" /> Main Event
          </Badge>
        )}
        {fight.isCoMainEvent && (
          <Badge tone="gold">
            <Star size={11} className="mr-1 inline" /> Co-Main
          </Badge>
        )}
        {fight.isTitleFight && <Badge tone="gold">Vale cinturão</Badge>}
        <span className="text-xs text-arena-text-faint">{fight.weightClass}</span>
        <span className="text-xs text-arena-text-faint">· {fight.rounds} rounds</span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-right">
          <p className="font-semibold leading-tight">{fight.fighterAName}</p>
          <p className="mt-1 text-sm font-mono text-arena-blue">{formatAmericanOdd(fight.oddFighterA)}</p>
        </div>
        <span className="rounded-full bg-arena-surface-hover px-2 py-1 text-xs font-bold text-arena-text-faint">
          VS
        </span>
        <div className="text-left">
          <p className="font-semibold leading-tight">{fight.fighterBName}</p>
          <p className="mt-1 text-sm font-mono text-arena-blue">{formatAmericanOdd(fight.oddFighterB)}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-1 border-t border-arena-border pt-3">
        <button
          onClick={onEdit}
          className="rounded-lg p-1.5 text-arena-text-faint hover:bg-arena-surface-hover hover:text-arena-text"
          aria-label="Editar luta"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-arena-text-faint hover:bg-arena-red/10 hover:text-arena-red"
          aria-label="Excluir luta"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
