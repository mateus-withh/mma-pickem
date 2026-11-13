export interface Profile {
  id: string
  name: string
  avatarUrl?: string
  /** Saldo inicial (editável apenas nas configurações administrativas). */
  initialBalance: number
  active: boolean
  /** Login (Supabase Auth) dono deste perfil. */
  userId?: string
  /** Só o administrador gerencia eventos, lutas, resultados, saldos e backups. */
  isAdmin?: boolean
  createdAt: string
  updatedAt: string
}
