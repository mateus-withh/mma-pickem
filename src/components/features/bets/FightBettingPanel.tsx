import { useState } from 'react'
import { Coins, X } from 'lucide-react'
import type { Fight } from '@/types/fight'
import type { Bet, BetSelection } from '@/types/bet'
import type { Profile } from '@/types/profile'
import type { WalletSummary } from '@/types/wallet'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BetDialog } from './BetDialog'
import { formatUfcPoints } from '@/utils/currency'
import { formatAmericanOdd } from '@/utils/odds'
import { BET_STATUS_LABELS, BET_STATUS_TONES } from '@/utils/mmaConstants'

interface FightBettingPanelProps {
  fight: Fight
  profiles: Profile[]
  wallets: Record<string, WalletSummary>
  betsForFight: Bet[]
  /** Quando true (já existe resultado registrado), não permite apostas novas. */
  isFinished?: boolean
  onPlaceBet: (profileId: string, selection: BetSelection, stake: number) => Promise<void>
  onCancelBet: (betId: string) => Promise<void>
}

/** O que de fato mudou no saldo do jogador com essa aposta, uma vez liquidada. */
function settledAmountLabel(bet: Bet): string | null {
  if (bet.status === 'WON') return `${formatUfcPoints(bet.potentialProfit, { showSign: true })} de lucro`
  if (bet.status === 'LOST') return `${formatUfcPoints(-bet.stake, { showSign: true })}`
  if (bet.status === 'VOID') return 'Valor devolvido'
  return null
}

export function FightBettingPanel({
  fight,
  profiles,
  wallets,
  betsForFight,
  isFinished = false,
  onPlaceBet,
  onCancelBet,
}: FightBettingPanelProps) {
  const [bettingProfile, setBettingProfile] = useState<Profile | null>(null)

  if (profiles.length === 0) return null

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {profiles.map((profile) => {
        const bet = betsForFight.find((b) => b.profileId === profile.id)
        const fighterName = bet?.selection === 'FIGHTER_A' ? fight.fighterAName : fight.fighterBName
        const settledLabel = bet ? settledAmountLabel(bet) : null

        return (
          <div key={profile.id} className="rounded-lg border border-arena-border bg-arena-bg/50 p-3">
            <p className="mb-1.5 text-xs font-medium text-arena-text-faint">{profile.name}</p>

            {bet ? (
              <div className="flex items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium">
                    {fighterName}{' '}
                    <span className="font-mono text-arena-blue">{formatAmericanOdd(bet.oddSnapshot)}</span>
                  </p>
                  <p className="text-xs text-arena-text-faint">
                    {formatUfcPoints(bet.stake)}
                    {settledLabel ? ` · ${settledLabel}` : ` · retorno pot. ${formatUfcPoints(bet.potentialPayout)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge tone={BET_STATUS_TONES[bet.status]}>{BET_STATUS_LABELS[bet.status]}</Badge>
                  {bet.status === 'PENDING' && (
                    <button
                      onClick={() => onCancelBet(bet.id)}
                      className="rounded p-1 text-arena-text-faint hover:bg-arena-red/10 hover:text-arena-red"
                      aria-label="Cancelar aposta"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ) : isFinished ? (
              <p className="text-xs text-arena-text-faint">Luta finalizada — sem aposta.</p>
            ) : (
              <Button variant="secondary" onClick={() => setBettingProfile(profile)}>
                <Coins size={14} /> Apostar
              </Button>
            )}
          </div>
        )
      })}

      {bettingProfile && (
        <BetDialog
          fight={fight}
          profile={bettingProfile}
          availableBalance={wallets[bettingProfile.id]?.availableBalance ?? 0}
          onClose={() => setBettingProfile(null)}
          onConfirm={({ selection, stake }) => onPlaceBet(bettingProfile.id, selection, stake)}
        />
      )}
    </div>
  )
}
