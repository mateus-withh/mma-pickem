type Row = Record<string, unknown>

const toSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
const toCamel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())

/** Lança um Error com a mensagem do banco (as funções SQL já devolvem mensagens em português). */
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

/** Linha do banco (snake_case) -> objeto do app (camelCase). Campos null viram "ausentes". */
export function fromRow<T>(row: unknown): T {
  const out: Row = {}
  for (const [key, value] of Object.entries((row ?? {}) as Row)) {
    if (value !== null) out[toCamel(key)] = value
  }
  return out as T
}

export function fromRows<T>(rows: unknown): T[] {
  return (Array.isArray(rows) ? rows : []).map((row) => fromRow<T>(row))
}

/** Objeto do app (camelCase) -> linha do banco (snake_case). Campos undefined são ignorados. */
export function toRow(obj: object): Row {
  const out: Row = {}
  for (const [key, value] of Object.entries(obj as Row)) {
    if (value !== undefined) out[toSnake(key)] = value
  }
  return out
}
