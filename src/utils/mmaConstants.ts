import type { EventStatus, EventType } from '@/types/event'
import type { BetStatus } from '@/types/bet'
import type { FightOutcome } from '@/types/fightResult'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  PPV: 'PPV',
  FIGHT_NIGHT: 'Fight Night',
  SPECIAL: 'Especial',
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Rascunho',
  OPEN_FOR_BETS: 'Aberto para apostas',
  IN_PROGRESS: 'Em andamento',
  FINISHED: 'Finalizado',
}

export const EVENT_STATUS_TONES: Record<EventStatus, 'muted' | 'gold' | 'green' | 'red'> = {
  DRAFT: 'muted',
  OPEN_FOR_BETS: 'gold',
  IN_PROGRESS: 'green',
  FINISHED: 'muted',
}

/** Divisões de peso padrão do MMA — terminologia genérica do esporte, não específica de uma organização. */
export const WEIGHT_CLASSES = [
  'Peso Palha (até 52,2 kg)',
  'Peso Mosca (até 56,7 kg)',
  'Peso Galo (até 61,2 kg)',
  'Peso Pena (até 65,8 kg)',
  'Peso Leve (até 70,3 kg)',
  'Peso Meio-Médio (até 77,1 kg)',
  'Peso Médio (até 83,9 kg)',
  'Meio-Pesado (até 93,0 kg)',
  'Peso Pesado (até 120,2 kg)',
]

export const BET_STATUS_LABELS: Record<BetStatus, string> = {
  PENDING: 'Pendente',
  WON: 'Vencedora',
  LOST: 'Perdida',
  VOID: 'Anulada',
}

export const BET_STATUS_TONES: Record<BetStatus, 'muted' | 'gold' | 'green' | 'red'> = {
  PENDING: 'gold',
  WON: 'green',
  LOST: 'red',
  VOID: 'muted',
}

export const FIGHT_OUTCOME_LABELS: Record<FightOutcome, string> = {
  FIGHTER_A: 'Lutador A',
  FIGHTER_B: 'Lutador B',
  DRAW: 'Empate',
  NO_CONTEST: 'No Contest',
}
