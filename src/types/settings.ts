export interface AppSettings {
  /** Singleton — sempre 'app-settings'. */
  id: string
  currencyName: string
  currencyAbbreviation: string
  defaultInitialBalance: number
  createdAt: string
  updatedAt: string
}
