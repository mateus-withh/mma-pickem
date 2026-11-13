import type { Transaction, TransactionType } from '@/types/transaction'
import { formatUfcPoints } from '@/utils/currency'
import { Badge } from '@/components/ui/Badge'

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INITIAL_BALANCE: 'Saldo inicial',
  BET_PLACED: 'Aposta realizada',
  BET_WON: 'Aposta vencedora',
  BET_LOST: 'Aposta perdida',
  BET_VOID: 'Aposta anulada',
  MANUAL_ADJUSTMENT: 'Ajuste manual',
}

interface TransactionHistoryListProps {
  transactions: Transaction[]
}

export function TransactionHistoryList({ transactions }: TransactionHistoryListProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-arena-text-faint">Nenhuma movimentação registrada ainda.</p>
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <ul className="divide-y divide-arena-border">
      {sorted.map((transaction) => (
        <li key={transaction.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <div>
            <p className="font-medium">{TRANSACTION_TYPE_LABELS[transaction.type]}</p>
            <p className="text-xs text-arena-text-faint">
              {transaction.description} ·{' '}
              {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Badge tone={transaction.amount >= 0 ? 'green' : 'red'}>
            {formatUfcPoints(transaction.amount, { showSign: true })}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
