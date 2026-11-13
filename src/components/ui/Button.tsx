import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

export function Button({ variant = 'secondary', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-arena-red text-white hover:bg-arena-red/90',
        variant === 'secondary' &&
          'bg-arena-surface-hover text-arena-text hover:bg-arena-border',
        variant === 'ghost' && 'text-arena-text-muted hover:bg-arena-surface-hover hover:text-arena-text',
        variant === 'danger' && 'bg-arena-red-dim text-white hover:bg-arena-red-dim/90',
        className,
      )}
      {...props}
    />
  )
}
