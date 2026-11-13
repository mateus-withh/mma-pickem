import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------------
// Tipos (espelham as colunas do banco; ajuste/mapeie para os tipos que
// o app ja usa, se os nomes forem diferentes)
// ---------------------------------------------------------------------

export type Pick = 'A' | 'B'
export type FightResult = 'A' | 'B' | 'DRAW' | 'NO_CONTEST'
export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'VOID'
export type TransactionType = 'INITIAL' | 'BET_PLACED' | 'BET_WON' | 'BET_LOST' | 'BET_VOID'

export interface Profile {
  id: string
  name: string
  created_at: string
}

export interface EventRow {
  id: string
  name: string
  event_date: string
  location: string | null
  status: 'UPCOMING' | 'COMPLETED'
  created_at: string
}

export interface Fight {
  id: string
  event_id: string
  fighter_a: string
  fighter_b: string
  odds_a: number
  odds_b: number
  position: number
  winner: FightResult | null
  method: string | null
  settled_at: string | null
  created_at: string
}

export interface Bet {
  id: string
  profile_id: string
  fight_id: string
  pick: Pick
  stake: number
  odds: number
  status: BetStatus
  created_at: string
  settled_at: string | null
}

export interface WalletTransaction {
  id: string
  profile_id: string
  bet_id: string | null
  type: TransactionType
  amount: number
  created_at: string
}

export interface WalletBalance {
  profile_id: string
  name: string
  total: number
  pending: number
  available: number
}

// ---------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message)
  return data as T
}

// ---------------------------------------------------------------------
// Perfis e carteira
// ---------------------------------------------------------------------

export async function listProfiles(): Promise<Profile[]> {
  return unwrap(await supabase.from('profiles').select('*').order('created_at'))
}

export async function createProfile(name: string): Promise<Profile> {
  // o trigger do banco ja credita os 100 pontos iniciais
  return unwrap(await supabase.from('profiles').insert({ name }).select().single())
}

export async function getBalances(): Promise<WalletBalance[]> {
  return unwrap(await supabase.from('wallet_balances').select('*'))
}

export async function listTransactions(profileId?: string): Promise<WalletTransaction[]> {
  let query = supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false })
  if (profileId) query = query.eq('profile_id', profileId)
  return unwrap(await query)
}

// ---------------------------------------------------------------------
// Eventos e lutas
// ---------------------------------------------------------------------

export async function listEvents(): Promise<EventRow[]> {
  return unwrap(await supabase.from('events').select('*').order('event_date', { ascending: false }))
}

export async function createEvent(input: {
  name: string
  event_date: string
  location?: string
}): Promise<EventRow> {
  return unwrap(await supabase.from('events').insert(input).select().single())
}

export async function deleteEvent(id: string): Promise<void> {
  unwrap(await supabase.from('events').delete().eq('id', id))
}

export async function listFights(eventId?: string): Promise<Fight[]> {
  let query = supabase.from('fights').select('*').order('position')
  if (eventId) query = query.eq('event_id', eventId)
  return unwrap(await query)
}

export async function createFight(input: {
  event_id: string
  fighter_a: string
  fighter_b: string
  odds_a: number
  odds_b: number
  position?: number
}): Promise<Fight> {
  return unwrap(await supabase.from('fights').insert(input).select().single())
}

// ---------------------------------------------------------------------
// Apostas e resultados (regras ficam no banco, via funcoes atomicas)
// ---------------------------------------------------------------------

export async function listBets(profileId?: string): Promise<Bet[]> {
  let query = supabase.from('bets').select('*').order('created_at', { ascending: false })
  if (profileId) query = query.eq('profile_id', profileId)
  return unwrap(await query)
}

export async function placeBet(input: {
  profileId: string
  fightId: string
  pick: Pick
  stake: number
}): Promise<Bet> {
  return unwrap(
    await supabase.rpc('place_bet', {
      p_profile: input.profileId,
      p_fight: input.fightId,
      p_pick: input.pick,
      p_stake: input.stake,
    }),
  )
}

/** Registra o resultado. Chamar de novo com outro vencedor corrige (reverte e reaplica). */
export async function settleFight(fightId: string, winner: FightResult, method?: string): Promise<void> {
  unwrap(
    await supabase.rpc('settle_fight', {
      p_fight: fightId,
      p_winner: winner,
      p_method: method ?? null,
    }),
  )
}

// ---------------------------------------------------------------------
// Tempo real: avisa quando QUALQUER tabela muda (inclusive por outro jogador)
// ---------------------------------------------------------------------

const TABLES = ['profiles', 'events', 'fights', 'bets', 'wallet_transactions'] as const

export function subscribeToChanges(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  // junta varias mudancas seguidas (ex.: uma liquidacao mexe em varias linhas) em um unico reload
  const notify = () => {
    clearTimeout(timer)
    timer = setTimeout(onChange, 150)
  }

  const channel = supabase.channel('pickem-arena')
  for (const table of TABLES) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, notify)
  }
  channel.subscribe()

  return () => {
    clearTimeout(timer)
    supabase.removeChannel(channel)
  }
}
