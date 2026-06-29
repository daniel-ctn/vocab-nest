import Link from 'next/link'
import { cn } from '@/lib/cn'
import { LogoMark, LogoMarkAnimated } from '@/components/ui/logo'

export function Wordmark({
  href = '/',
  size = 'md',
  animated = true,
  className,
}: {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  /** One-shot reveal on mount. Off for dense/repeated placements. */
  animated?: boolean
  className?: string
}) {
  const text =
    size === 'lg'
      ? 'text-[16px]'
      : size === 'sm'
        ? 'text-[12px]'
        : 'text-[14px]'
  const mark = size === 'lg' ? 32 : size === 'sm' ? 22 : 28
  const Mark = animated ? LogoMarkAnimated : LogoMark
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5"
      aria-label="Vocab Nest"
    >
      <Mark size={mark} decorative />
      <span
        className={cn(
          'font-mono font-medium uppercase tracking-[0.2em] text-ink',
          text
        )}
      >
        Vocab&nbsp;Nest
      </span>
    </Link>
  )
}
