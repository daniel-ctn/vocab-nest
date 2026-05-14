import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

/**
 * Specimen — a typeset entry on the page. Replaces "card" for vocab/groups.
 *
 * The list is delimited by hairline rules, not boxes. Each specimen lives
 * inside <SpecimenList>, which paints the rules between siblings.
 */

export function SpecimenList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'divide-y divide-rule [&>*]:py-5 first:[&>*]:pt-0 last:[&>*]:pb-0',
        className
      )}
    >
      {children}
    </div>
  )
}

type SpecimenProps = {
  href?: string
  onClick?: () => void
  className?: string
  children: ReactNode
}

export function Specimen({ href, onClick, className, children }: SpecimenProps) {
  const inner = (
    <div
      className={cn(
        'flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6',
        className
      )}
    >
      {children}
    </div>
  )
  if (href) {
    return (
      <Link
        href={href}
        className="group block transition-colors hover:[&_[data-specimen-term]]:text-accent"
      >
        {inner}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group block w-full text-left transition-colors hover:[&_[data-specimen-term]]:text-accent"
      >
        {inner}
      </button>
    )
  }
  return inner
}

export function SpecimenTerm({
  children,
  className,
  size = 'md',
}: {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass =
    size === 'sm'
      ? 'text-[18px]'
      : size === 'lg'
        ? 'text-[28px] sm:text-[32px]'
        : 'text-[22px]'
  return (
    <h3
      data-specimen-term
      className={cn(
        'font-display font-semibold leading-tight tracking-tight text-ink transition-colors',
        sizeClass,
        className
      )}
    >
      {children}
    </h3>
  )
}

export function SpecimenDefinition({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'font-display italic text-[16px] leading-snug text-ink-secondary',
        className
      )}
    >
      {children}
    </p>
  )
}

export function SpecimenBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0 space-y-1.5', className)}>{children}</div>
  )
}

export function SpecimenAside({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-3 text-ink-tertiary',
        className
      )}
    >
      {children}
    </div>
  )
}

export function SpecimenMeta({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-tertiary',
        className
      )}
    >
      {children}
    </div>
  )
}
