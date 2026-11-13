import { supabase } from './supabase'

const TABLES = [
  'profiles',
  'transactions',
  'app_settings',
  'events',
  'fights',
  'bets',
  'results',
  'result_audits',
] as const

/**
 * Avisa quando QUALQUER tabela muda (inclusive por outro jogador).
 * Várias mudanças seguidas (uma liquidação mexe em várias linhas) viram um único aviso.
 * Retorna a função que cancela a assinatura.
 */
export function subscribeToChanges(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
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
