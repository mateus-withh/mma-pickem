import type { Profile } from './profile'
import type { Transaction } from './transaction'
import type { AppSettings } from './settings'
import type { MmaEvent } from './event'
import type { Fight } from './fight'
import type { Bet } from './bet'
import type { FightResult, ResultAuditEntry } from './fightResult'

/** Formato do arquivo de backup exportado/importado na Fase 8. */
export interface BackupData {
  formatVersion: number
  exportedAt: string
  profiles: Profile[]
  transactions: Transaction[]
  settings: AppSettings[]
  events: MmaEvent[]
  fights: Fight[]
  bets: Bet[]
  results: FightResult[]
  resultAudits: ResultAuditEntry[]
}
