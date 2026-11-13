import type { ReactNode } from 'react'
import clsx from 'clsx'

interface BadgeProps {
  children: ReactNode
  tone?: 'green' | 'red' | 'muted' | 'gold'
}

export function Badge({ children, tone = 'muted' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone === 'green' && 'bg-arena-green/15 text-arena-green',
        tone === 'red' && 'bg-arena-red/15 text-arena-red',
        tone === 'gold' && 'bg-arena-gold/15 text-arena-gold',
        tone === 'muted' && 'bg-arena-surface-hover text-arena-text-faint',
      )}
    >
      {children}
    </span>
  )
}
