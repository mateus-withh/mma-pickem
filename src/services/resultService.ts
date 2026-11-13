import { supabase } from '@/lib/supabase'
import { fromRow, unwrap } from '@/lib/supabaseHelpers'
import type { FightResult, FightOutcome, ResultAuditEntry } from '@/types/fightResult'

export async function getResultForFight(fightId: string): Promise<FightResult | undefined> {
  const row = unwrap(await supabase.from('results').select('*').eq('fight_id', fightId).maybeSingle())
  return row ? fromRow<FightResult>(row) : undefined
}

export async function listResultAudits(fightId: string): Promise<ResultAuditEntry[]> {
  const rows = unwrap(
    await supabase
      .from('result_audits')
      .select('*')
      .eq('fight_id', fightId)
      .order('changed_at', { ascending: false }),
  ) as Array<Record<string, unknown>>

  return rows.map((row) => ({
    ...fromRow<ResultAuditEntry>(row),
    // previousOutcome é null (e não "ausente") na primeira vez que o resultado é registrado.
    previousOutcome: (row.previous_outcome as FightOutcome | null) ?? null,
  }))
}

export interface RegisterResultInput {
  fightId: string
  eventId: string
  outcome: FightOutcome
  method?: string
  round?: number
  time?: string
  notes?: string
}

/**
 * Registra (ou corrige) o resultado de uma luta e liquida automaticamente
 * todas as apostas pendentes daquela luta.
 *
 * Tudo acontece numa única transação no banco (função register_result):
 * se já existir um resultado, a liquidação anterior é revertida por completo
 * antes de aplicar o novo — nunca duplica ganhos ou perdas — e uma entrada
 * de auditoria é registrada.
 */
export async function registerResult(input: RegisterResultInput): Promise<FightResult> {
  const row = unwrap(
    await supabase.rpc('register_result', {
      p_fight: input.fightId,
      p_outcome: input.outcome,
      p_method: input.method ?? null,
      p_round: input.round ?? null,
      p_time: input.time ?? null,
      p_notes: input.notes ?? null,
    }),
  )
  return fromRow<FightResult>(row)
}

/** Remove o resultado de uma luta e reverte a liquidação — as apostas voltam a ficar pendentes. */
export async function deleteResult(fightId: string): Promise<void> {
  unwrap(await supabase.rpc('delete_result', { p_fight: fightId }))
}
