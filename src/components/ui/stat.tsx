import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Caps } from './caps'

export function Stat({
  value,
  label,
  hint,
  active = false,
  className,
}: {
  value: ReactNode
  label: ReactNode
  hint?: ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        className={cn(
          'font-display text-[44px] leading-none font-semibold tracking-tight sm:text-[56px]',
          active ? 'text-accent' : 'text-ink'
        )}
      >
        {value}
      </div>
      <Caps>{label}</Caps>
      {hint && (
        <div className="text-[12px] font-display italic text-ink-tertiary">
          {hint}
        </div>
      )}
    </div>
  )
}

export function StatRow({
  children,
  className,
  cols = 3,
}: {
  children: ReactNode
  className?: string
  cols?: 2 | 3 | 4
}) {
  const colsClass =
    cols === 2
      ? 'grid-cols-2'
      : cols === 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-3'
  return (
    <div className={cn('grid gap-x-6 gap-y-8', colsClass, className)}>
      {children}
    </div>
  )
}
