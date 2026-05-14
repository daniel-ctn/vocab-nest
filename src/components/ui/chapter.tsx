import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Caps } from './caps'
import { Rule } from './rule'

export function Chapter({
  eyebrow,
  title,
  subtitle,
  aside,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  aside?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('space-y-4', className)}>
      {eyebrow && <Caps as="div">{eyebrow}</Caps>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      <Rule animate />
      {subtitle && (
        <p className="max-w-xl text-[15px] leading-relaxed text-ink-secondary">
          {subtitle}
        </p>
      )}
    </header>
  )
}
