export interface Fight {
  id: string
  eventId: string
  fighterAName: string
  fighterBName: string
  weightClass: string
  rounds: 3 | 5
  /** Posição no card — números menores lutam mais cedo (1 = abertura). */
  cardPosition: number
  isMainEvent: boolean
  isCoMainEvent: boolean
  isTitleFight: boolean
  /** Odd americana do Lutador A no momento do cadastro (ex: -150, +130). */
  oddFighterA: number
  oddFighterB: number
  createdAt: string
  updatedAt: string
}
