import type { LucideIcon } from 'lucide-react'

interface ComingSoonProps {
  icon: LucideIcon
  title: string
  description: string
  phase: string
}

export function ComingSoon({ icon: Icon, title, description, phase }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-arena-border bg-arena-surface/40 px-6 py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-arena-surface text-arena-text-muted mb-4">
        <Icon size={26} />
      </div>
      <h2 className="text-lg font-semibold text-arena-text">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-arena-text-muted">{description}</p>
      <span className="mt-4 rounded-full border border-arena-border px-3 py-1 text-xs font-medium text-arena-text-faint">
        {phase}
      </span>
    </div>
  )
}
