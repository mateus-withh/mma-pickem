export interface Profile {
  id: string
  name: string
  avatarUrl?: string
  /** Saldo inicial (editável apenas nas configurações administrativas). */
  initialBalance: number
  active: boolean
  createdAt: string
  updatedAt: string
}
