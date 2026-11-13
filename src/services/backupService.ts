import { z } from 'zod'
import { db } from '@/db/schema'
import type { BackupData } from '@/types/backup'

const BACKUP_FORMAT_VERSION = 1

/** Zod não valida contra as interfaces TypeScript diretamente — este schema
 * é mantido manualmente em espelho aos tipos em `src/types`. Qualquer campo
 * novo adicionado a um tipo deve ser refletido aqui também. */
const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().optional(),
  initialBalance: z.number(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const transactionSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  type: z.enum(['INITIAL_BALANCE', 'BET_PLACED', 'BET_WON', 'BET_LOST', 'BET_VOID', 'MANUAL_ADJUSTMENT']),
  amount: z.number(),
  description: z.string(),
  relatedBetId: z.string().optional(),
  createdAt: z.string(),
})

const settingsSchema = z.object({
  id: z.string(),
  currencyName: z.string(),
  currencyAbbreviation: z.string(),
  defaultInitialBalance: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  location: z.string(),
  arena: z.string(),
  type: z.enum(['PPV', 'FIGHT_NIGHT', 'SPECIAL']),
  status: z.enum(['DRAFT', 'OPEN_FOR_BETS', 'IN_PROGRESS', 'FINISHED']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const fightSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  fighterAName: z.string(),
  fighterBName: z.string(),
  weightClass: z.string(),
  rounds: z.union([z.literal(3), z.literal(5)]),
  cardPosition: z.number(),
  isMainEvent: z.boolean(),
  isCoMainEvent: z.boolean(),
  isTitleFight: z.boolean(),
  oddFighterA: z.number(),
  oddFighterB: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const betSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  fightId: z.string(),
  eventId: z.string(),
  betType: z.literal('WINNER'),
  selection: z.enum(['FIGHTER_A', 'FIGHTER_B']),
  stake: z.number(),
  oddSnapshot: z.number(),
  status: z.enum(['PENDING', 'WON', 'LOST', 'VOID']),
  potentialProfit: z.number(),
  potentialPayout: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  settledAt: z.string().optional(),
})

const resultSchema = z.object({
  id: z.string(),
  fightId: z.string(),
  eventId: z.string(),
  outcome: z.enum(['FIGHTER_A', 'FIGHTER_B', 'DRAW', 'NO_CONTEST']),
  method: z.string().optional(),
  round: z.number().optional(),
  time: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const resultAuditSchema = z.object({
  id: z.string(),
  fightId: z.string(),
  eventId: z.string(),
  previousOutcome: z.enum(['FIGHTER_A', 'FIGHTER_B', 'DRAW', 'NO_CONTEST']).nullable(),
  newOutcome: z.enum(['FIGHTER_A', 'FIGHTER_B', 'DRAW', 'NO_CONTEST']),
  changedAt: z.string(),
})

const backupDataSchema = z.object({
  formatVersion: z.number(),
  exportedAt: z.string(),
  profiles: z.array(profileSchema),
  transactions: z.array(transactionSchema),
  settings: z.array(settingsSchema),
  events: z.array(eventSchema),
  fights: z.array(fightSchema),
  bets: z.array(betSchema),
  results: z.array(resultSchema),
  resultAudits: z.array(resultAuditSchema),
})

export async function exportBackup(): Promise<BackupData> {
  const [profiles, transactions, settings, events, fights, bets, results, resultAudits] = await Promise.all(
    [
      db.profiles.toArray(),
      db.transactions.toArray(),
      db.settings.toArray(),
      db.events.toArray(),
      db.fights.toArray(),
      db.bets.toArray(),
      db.results.toArray(),
      db.resultAudits.toArray(),
    ],
  )

  return {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    profiles,
    transactions,
    settings,
    events,
    fights,
    bets,
    results,
    resultAudits,
  }
}

export function backupFileName(date = new Date()): string {
  const isoDate = date.toISOString().slice(0, 10)
  return `ufc-points-backup-${isoDate}.json`
}

/** Dispara o download do arquivo JSON no navegador. */
export function downloadBackup(data: BackupData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = backupFileName()
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Lê e VALIDA um arquivo antes de aceitar como backup — nunca importa dados não confiáveis sem checar o formato. */
export async function readBackupFile(file: File): Promise<BackupData> {
  const text = await file.text()

  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('O arquivo selecionado não é um JSON válido.')
  }

  const parsed = backupDataSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error("O arquivo não tem o formato esperado de um backup do Pick'em Arena.")
  }

  if (parsed.data.formatVersion > BACKUP_FORMAT_VERSION) {
    throw new Error('Este backup foi exportado por uma versão mais nova do app e não pode ser importado aqui.')
  }

  return parsed.data
}

export type ImportMode = 'merge' | 'replace'

/**
 * Importa um backup já validado.
 * - "merge": faz upsert em todas as tabelas — nada é apagado, apenas
 *   adicionado ou atualizado (registros com o mesmo ID são sobrescritos
 *   pelos do arquivo).
 * - "replace": apaga TUDO antes de importar. Irreversível — a confirmação
 *   explícita é responsabilidade da UI, nunca feita aqui silenciosamente.
 */
export async function importBackup(data: BackupData, mode: ImportMode): Promise<void> {
  await db.transaction(
    'rw',
    [db.profiles, db.transactions, db.settings, db.events, db.fights, db.bets, db.results, db.resultAudits],
    async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.profiles.clear(),
          db.transactions.clear(),
          db.settings.clear(),
          db.events.clear(),
          db.fights.clear(),
          db.bets.clear(),
          db.results.clear(),
          db.resultAudits.clear(),
        ])
      }

      await Promise.all([
        db.profiles.bulkPut(data.profiles),
        db.transactions.bulkPut(data.transactions),
        db.settings.bulkPut(data.settings),
        db.events.bulkPut(data.events),
        db.fights.bulkPut(data.fights),
        db.bets.bulkPut(data.bets),
        db.results.bulkPut(data.results),
        db.resultAudits.bulkPut(data.resultAudits),
      ])
    },
  )
}
