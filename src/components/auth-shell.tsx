import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Rule } from '@/components/ui/rule'
import { Wordmark } from '@/components/ui/wordmark'

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-cream">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-6 py-6">
        <Wordmark size="sm" href="/" />
        <ThemeToggle className="inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-[12px] text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink" />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        <div className="space-y-8">
          <div className="space-y-3">
            {eyebrow && (
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-secondary">
                {eyebrow}
              </div>
            )}
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-[44px]">
              {title}
            </h1>
            <Rule animate />
            {subtitle && (
              <p className="font-display italic text-[16px] leading-relaxed text-ink-secondary">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
