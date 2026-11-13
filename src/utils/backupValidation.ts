import { z } from 'zod'

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

const outcomeSchema = z.enum(['FIGHTER_A', 'FIGHTER_B', 'DRAW', 'NO_CONTEST'])

const resultSchema = z.object({
  id: z.string(),
  fightId: z.string(),
  eventId: z.string(),
  outcome: outcomeSchema,
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
  previousOutcome: outcomeSchema.nullable(),
  newOutcome: outcomeSchema,
  changedAt: z.string(),
})

export const backupDataSchema = z.object({
  version: z.number(),
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
