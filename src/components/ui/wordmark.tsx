import Link from 'next/link'
import { Feather } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Wordmark({
  href = '/',
  size = 'md',
  className,
}: {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const text =
    size === 'lg'
      ? 'text-[16px]'
      : size === 'sm'
        ? 'text-[12px]'
        : 'text-[14px]'
  const box =
    size === 'lg' ? 'h-9 w-9' : size === 'sm' ? 'h-6 w-6' : 'h-7 w-7'
  const icon = size === 'lg' ? 18 : size === 'sm' ? 12 : 14
  return (
    <Link
      href={href}
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="Vocab Nest"
    >
      <span
        className={cn(
          'inline-flex items-center justify-center border border-ink/80 text-ink transition-colors group-hover:bg-ink group-hover:text-cream',
          box
        )}
      >
        <Feather size={icon} strokeWidth={2} />
      </span>
      <span
        className={cn(
          'font-semibold uppercase tracking-[0.22em] text-ink',
          text
        )}
      >
        Vocab&nbsp;Nest
      </span>
    </Link>
  )
}
