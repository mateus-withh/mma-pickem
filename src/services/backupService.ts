import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { fromRows, toRow, unwrap } from '@/lib/supabaseHelpers'
import type {
  AppSettings,
  Bet,
  BackupData,
  Fight,
  FightOutcome,
  FightResult,
  MmaEvent,
  Profile,
  ResultAuditEntry,
  Transaction,
} from '@/types'

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

async function fetchTable<T>(table: string): Promise<T[]> {
  const rows = unwrap(await supabase.from(table).select('*'))
  return fromRows<T>(rows)
}

/** Exporta TODOS os dados que estão hoje no Supabase. */
export async function exportBackup(): Promise<BackupData> {
  const [profiles, transactions, settings, events, fights, bets, results, auditRows] = await Promise.all([
    fetchTable<Profile>('profiles'),
    fetchTable<Transaction>('transactions'),
    fetchTable<AppSettings>('app_settings'),
    fetchTable<MmaEvent>('events'),
    fetchTable<Fight>('fights'),
    fetchTable<Bet>('bets'),
    fetchTable<FightResult>('results'),
    supabase.from('result_audits').select('*').then((res) => unwrap(res) as Array<Record<string, unknown>>),
  ])

  // previousOutcome é null (e não "ausente") na primeira vez que o resultado é registrado.
  const resultAudits = auditRows.map((row) => ({
    ...fromRows<ResultAuditEntry>([row])[0],
    previousOutcome: (row.previous_outcome as FightOutcome | null) ?? null,
  }))

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
 * Importa um backup já validado para o Supabase, numa única transação
 * (função import_backup): se qualquer registro falhar, nada é importado.
 * - "merge": faz upsert em todas as tabelas — nada é apagado, apenas
 *   adicionado ou atualizado (registros com o mesmo ID são sobrescritos
 *   pelos do arquivo).
 * - "replace": apaga TUDO antes de importar. Irreversível — a confirmação
 *   explícita é responsabilidade da UI, nunca feita aqui silenciosamente.
 */
export async function importBackup(data: BackupData, mode: ImportMode): Promise<void> {
  const payload = {
    profiles: data.profiles.map((row) => toRow(row)),
    app_settings: data.settings.map((row) => toRow(row)),
    events: data.events.map((row) => toRow(row)),
    fights: data.fights.map((row) => toRow(row)),
    bets: data.bets.map((row) => toRow(row)),
    transactions: data.transactions.map((row) => toRow(row)),
    results: data.results.map((row) => toRow(row)),
    result_audits: data.resultAudits.map((row) => toRow(row)),
  }

  unwrap(await supabase.rpc('import_backup', { p_data: payload, p_mode: mode }))
}
