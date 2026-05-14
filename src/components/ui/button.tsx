import Link from 'next/link'
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'link' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 focus-visible:ring-offset-cream whitespace-nowrap'

const variants: Record<Variant, string> = {
  // Ink — the default. Letterpress stamp.
  primary: 'rounded-sm bg-ink text-cream hover:bg-ink/85 active:bg-ink',
  // Terracotta — strictly stateful: due / current / required.
  accent: 'rounded-sm bg-accent text-white hover:bg-accent-hover',
  // 1px ink border, fills on hover.
  outline:
    'rounded-sm border border-ink/70 text-ink hover:bg-ink hover:text-cream',
  // No chrome.
  ghost:
    'rounded-sm text-ink-secondary hover:text-ink hover:bg-border-subtle',
  // Inline text with terracotta underline.
  link: 'text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px] hover:decoration-accent-hover hover:text-ink px-0 py-0',
  // Quiet destructive.
  danger:
    'rounded-sm border border-error/30 text-error hover:bg-error-subtle hover:border-error/50',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2 text-[13px]',
  lg: 'px-5 py-2.5 text-[14px]',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ComponentPropsWithoutRef<'button'>
type LinkProps = CommonProps & Omit<ComponentPropsWithoutRef<typeof Link>, 'className' | 'children'> & { href: string }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, ...rest },
  ref
) {
  const classes = cn(
    base,
    variants[variant],
    variant !== 'link' && sizes[size],
    className
  )
  return (
    <button ref={ref} className={classes} {...rest}>
      {children}
    </button>
  )
})

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  href,
  ...rest
}: LinkProps) {
  const classes = cn(
    base,
    variants[variant],
    variant !== 'link' && sizes[size],
    className
  )
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  )
}
