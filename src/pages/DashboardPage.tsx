import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Swords } from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import { useEventStore } from '@/store/eventStore'
import { useBetStore } from '@/store/betStore'
import { ProfileCard } from '@/components/features/profiles/ProfileCard'
import { NextEventCard } from '@/components/features/dashboard/NextEventCard'
import { RankingTable } from '@/components/features/statistics/RankingTable'
import { ComingSoon } from '@/components/ui/ComingSoon'
import { buildRanking, sortRanking } from '@/utils/ranking'

export function DashboardPage() {
  const profiles = useProfileStore((state) => state.profiles)
  const wallets = useProfileStore((state) => state.wallets)
  const isLoadingProfiles = useProfileStore((state) => state.isLoading)

  const events = useEventStore((state) => state.events)
  const fightsByEvent = useEventStore((state) => state.fightsByEvent)
  const loadEvents = useEventStore((state) => state.loadEvents)
  const loadFights = useEventStore((state) => state.loadFights)

  const bets = useBetStore((state) => state.bets)
  const loadBets = useBetStore((state) => state.loadBets)

  useEffect(() => {
    loadEvents()
    loadBets()
  }, [loadEvents, loadBets])

  useEffect(() => {
    events.forEach((event) => {
      if (!fightsByEvent[event.id]) loadFights(event.id)
    })
  }, [events, fightsByEvent, loadFights])

  const activeProfiles = profiles.filter((profile) => profile.active)

  const nextEvent = [...events]
    .filter((event) => event.status !== 'FINISHED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  const nextEventFights = nextEvent ? (fightsByEvent[nextEvent.id] ?? []) : []
  const nextEventBets = nextEvent ? bets.filter((bet) => bet.eventId === nextEvent.id) : []

  const rankingPreview = sortRanking(buildRanking(profiles, wallets, bets), 'balance').slice(0, 3)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-arena-text-muted">Visão geral dos perfis, próximo evento e ranking.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-arena-text-faint">Perfis</h2>
        {isLoadingProfiles && profiles.length === 0 ? (
          <p className="text-sm text-arena-text-muted">Carregando perfis...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                wallet={wallets[profile.id]}
                statsHref={`/perfis/${profile.id}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-arena-text-faint">
          Próximo evento
        </h2>
        {nextEvent ? (
          <NextEventCard
            event={nextEvent}
            fights={nextEventFights}
            bets={nextEventBets}
            profiles={activeProfiles}
          />
        ) : (
          <ComingSoon
            icon={Swords}
            title="Nenhum evento em aberto"
            description='Cadastre um evento na aba "Eventos" para vê-lo aparecer aqui.'
            phase="Eventos"
          />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-arena-text-faint">Ranking</h2>
          <Link to="/ranking" className="text-xs font-medium text-arena-red hover:underline">
            Ver ranking completo
          </Link>
        </div>
        {rankingPreview.length === 0 ? (
          <p className="text-sm text-arena-text-muted">Nenhum perfil cadastrado ainda.</p>
        ) : (
          <RankingTable entries={rankingPreview} compact />
        )}
      </section>
    </div>
  )
}
