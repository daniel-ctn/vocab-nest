import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Caps } from './caps'

/**
 * LedgerStat — a quiet figure in a row of figures: a Caps label over a large
 * Fraunces tabular number, terracotta when it marks live state, with an
 * optional italic hint beneath. Subordinate to a page's hero; reads as a
 * ledger line, not a metric card.
 */

type LedgerSize = 'sm' | 'md' | 'lg'

const sizeClass: Record<LedgerSize, string> = {
  sm: 'text-[26px] sm:text-[30px]',
  md: 'text-[28px] sm:text-[32px]',
  lg: 'text-[30px] sm:text-[36px]',
}

export function LedgerStat({
  label,
  value,
  hint,
  active = false,
  size = 'md',
  className,
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  active?: boolean
  size?: LedgerSize
  className?: string
}) {
  return (
    <div className={className}>
      <Caps>{label}</Caps>
      <div
        className={cn(
          'mt-1.5 font-display font-semibold leading-none tracking-[-0.02em] tabular-nums',
          sizeClass[size],
          active ? 'text-accent' : 'text-ink'
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-2 min-h-5">{hint}</div>}
    </div>
  )
}

/**
 * Ledger — a row of LedgerStats split by hairline rules, run-in with breathing
 * room and flush at the outer edges. Three columns by default; pass a className
 * to change the grid.
 */
export function Ledger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-3 divide-x divide-rule [&>*]:px-4 sm:[&>*]:px-6 [&>*:first-child]:pl-0 [&>*:last-child]:pr-0',
        className
      )}
    >
      {children}
    </div>
  )
}
