import { Link } from 'react-router-dom'
import { Calendar, MapPin, Swords } from 'lucide-react'
import type { MmaEvent } from '@/types/event'
import type { Fight } from '@/types/fight'
import type { Bet } from '@/types/bet'
import type { Profile } from '@/types/profile'
import { Badge } from '@/components/ui/Badge'
import { EVENT_STATUS_LABELS, EVENT_STATUS_TONES, EVENT_TYPE_LABELS } from '@/utils/mmaConstants'

interface NextEventCardProps {
  event: MmaEvent
  fights: Fight[]
  bets: Bet[]
  profiles: Profile[]
}

export function NextEventCard({ event, fights, bets, profiles }: NextEventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Link
      to={`/events/${event.id}`}
      className="block rounded-2xl border border-arena-border bg-arena-surface p-5 transition-colors hover:border-arena-red/40 hover:bg-arena-surface-hover"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-arena-text-faint">
            {EVENT_TYPE_LABELS[event.type]}
          </p>
          <h3 className="mt-0.5 text-lg font-bold leading-tight">{event.name}</h3>
        </div>
        <Badge tone={EVENT_STATUS_TONES[event.status]}>{EVENT_STATUS_LABELS[event.status]}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-arena-text-muted">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-arena-text-faint" />
          {formattedDate}
        </div>
        {(event.arena || event.location) && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-arena-text-faint" />
            {[event.arena, event.location].filter(Boolean).join(' · ')}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Swords size={14} className="text-arena-text-faint" />
          {fights.length} {fights.length === 1 ? 'luta' : 'lutas'}
        </div>
      </div>

      {fights.length > 0 && profiles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-arena-border pt-3 text-sm">
          {profiles.map((profile) => {
            const count = bets.filter((bet) => bet.profileId === profile.id).length
            return (
              <p key={profile.id} className="text-arena-text-muted">
                <span className="font-medium text-arena-text">{profile.name}</span> apostou em {count} de{' '}
                {fights.length} {fights.length === 1 ? 'luta' : 'lutas'}
              </p>
            )
          })}
        </div>
      )}
    </Link>
  )
}
