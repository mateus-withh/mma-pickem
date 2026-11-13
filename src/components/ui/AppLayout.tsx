import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Trophy,
  Swords,
  History,
  Settings,
  Flame,
} from 'lucide-react'
import clsx from 'clsx'
import { useProfileStore } from '@/store/profileStore'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/events', label: 'Eventos', icon: Swords },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/historico', label: 'Histórico', icon: History },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function AppLayout() {
  const init = useProfileStore((state) => state.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <div className="min-h-screen bg-arena-bg text-arena-text flex">
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-arena-border bg-arena-surface/60 p-4">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-arena-red/15 text-arena-red">
            <Flame size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold leading-tight tracking-tight">Pick'em Arena</p>
            <p className="text-xs text-arena-text-faint leading-tight">UFC Points League</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-arena-red/10 text-arena-red'
                    : 'text-arena-text-muted hover:bg-arena-surface-hover hover:text-arena-text',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-lg border border-arena-border bg-arena-surface p-3">
          <p className="text-xs text-arena-text-faint">
            Moeda fictícia. Sem dinheiro real, sem apostas reais.
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between border-b border-arena-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arena-red/15 text-arena-red">
              <Flame size={16} strokeWidth={2.5} />
            </div>
            <p className="font-bold text-sm">Pick'em Arena</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

        <nav className="md:hidden sticky bottom-0 border-t border-arena-border bg-arena-surface/95 backdrop-blur flex justify-around py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium',
                  isActive ? 'text-arena-red' : 'text-arena-text-faint',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
