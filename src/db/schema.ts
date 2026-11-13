import Dexie, { type Table } from 'dexie'
import type { Profile } from '@/types/profile'
import type { Transaction } from '@/types/transaction'
import type { AppSettings } from '@/types/settings'
import type { MmaEvent } from '@/types/event'
import type { Fight } from '@/types/fight'
import type { Bet } from '@/types/bet'
import type { FightResult, ResultAuditEntry } from '@/types/fightResult'

/** Banco local (IndexedDB) via Dexie.js. */
export class AppDatabase extends Dexie {
  profiles!: Table<Profile, string>
  transactions!: Table<Transaction, string>
  settings!: Table<AppSettings, string>
  events!: Table<MmaEvent, string>
  fights!: Table<Fight, string>
  bets!: Table<Bet, string>
  results!: Table<FightResult, string>
  resultAudits!: Table<ResultAuditEntry, string>

  constructor() {
    super('mma-pickem-db')

    this.version(1).stores({
      profiles: 'id, name, active, createdAt',
      transactions: 'id, profileId, type, createdAt',
      settings: 'id',
    })

    // Fase 3: eventos e lutas.
    this.version(2).stores({
      profiles: 'id, name, active, createdAt',
      transactions: 'id, profileId, type, createdAt',
      settings: 'id',
      events: 'id, status, date, createdAt',
      fights: 'id, eventId, cardPosition, createdAt',
    })

    // Fase 4: sistema de apostas.
    this.version(3).stores({
      profiles: 'id, name, active, createdAt',
      transactions: 'id, profileId, type, createdAt',
      settings: 'id',
      events: 'id, status, date, createdAt',
      fights: 'id, eventId, cardPosition, createdAt',
      bets: 'id, profileId, fightId, eventId, status, createdAt',
    })

    // Fase 5: resultados e liquidação automática.
    this.version(4).stores({
      profiles: 'id, name, active, createdAt',
      transactions: 'id, profileId, type, createdAt',
      settings: 'id',
      events: 'id, status, date, createdAt',
      fights: 'id, eventId, cardPosition, createdAt',
      bets: 'id, profileId, fightId, eventId, status, createdAt',
      results: 'id, fightId, eventId, createdAt',
      resultAudits: 'id, fightId, eventId, createdAt',
    })
  }
}

export const db = new AppDatabase()
