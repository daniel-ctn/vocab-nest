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
    <header className={cn('space-y-5', className)}>
      {eyebrow && (
        <Caps as="div" className="animate-fade-up text-accent">
          {eyebrow}
        </Caps>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="animate-fade-up font-display text-[40px] font-semibold leading-[0.96] tracking-[-0.02em] text-ink sm:text-[56px] lg:text-[64px]">
          {title}
        </h1>
        {aside && <div className="shrink-0 animate-fade-up">{aside}</div>}
      </div>
      <Rule animate />
      {subtitle && (
        <p className="max-w-xl font-display text-[18px] italic leading-relaxed text-ink-secondary">
          {subtitle}
        </p>
      )}
    </header>
  )
}
