import { Link } from 'react-router-dom'
import { Calendar, MapPin, Swords } from 'lucide-react'
import type { MmaEvent } from '@/types/event'
import { Badge } from '@/components/ui/Badge'
import { EVENT_STATUS_LABELS, EVENT_STATUS_TONES, EVENT_TYPE_LABELS } from '@/utils/mmaConstants'

interface EventCardProps {
  event: MmaEvent
  fightCount: number
}

export function EventCard({ event, fightCount }: EventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link
      to={`/events/${event.id}`}
      className="block rounded-2xl border border-arena-border bg-arena-surface p-5 transition-colors hover:border-arena-red/40 hover:bg-arena-surface-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-arena-text-faint">
            {EVENT_TYPE_LABELS[event.type]}
          </p>
          <h3 className="mt-0.5 font-semibold leading-tight">{event.name}</h3>
        </div>
        <Badge tone={EVENT_STATUS_TONES[event.status]}>{EVENT_STATUS_LABELS[event.status]}</Badge>
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-arena-text-muted">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-arena-text-faint" />
          {formattedDate}
        </div>
        {(event.location || event.arena) && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-arena-text-faint" />
            {[event.arena, event.location].filter(Boolean).join(' · ')}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Swords size={14} className="text-arena-text-faint" />
          {fightCount} {fightCount === 1 ? 'luta' : 'lutas'}
        </div>
      </div>
    </Link>
  )
}
