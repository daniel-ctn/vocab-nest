'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, MoreHorizontal, Settings, Shield } from 'lucide-react'
import { LogoMarkAnimated } from '@/components/ui/logo'
import { signOut } from '@/lib/auth-client'
import { ThemeToggle } from '@/components/theme-toggle'
import { PageProgress } from '@/components/page-progress'
import { TimeZoneSync } from '@/components/timezone-sync'
import { Caps } from '@/components/ui/caps'
import { Rule } from '@/components/ui/rule'
import { toRoman } from '@/components/ui/roman'
import { cn } from '@/lib/cn'

type NavItem = {
  href: string
  label: string
  /** Show in the bottom mobile bar */
  mobile?: boolean
}

/** Live counts for the shell: the due state and the nest's folio. */
type NavSummary = { dueToday: number; totalWords: number }

const primaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', mobile: true },
  { href: '/vocabulary', label: 'Vocabulary', mobile: true },
  { href: '/groups', label: 'Groups' },
  { href: '/practice', label: 'Practice', mobile: true },
  { href: '/stats', label: 'Stats', mobile: true },
]

function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const titleSize = size === 'sm' ? 'text-[13px]' : 'text-[14px]'
  return (
    <Link
      href="/dashboard"
      className="group inline-flex items-center gap-2.5"
      aria-label="Vocab Nest — Dashboard"
    >
      <LogoMarkAnimated size={size === 'sm' ? 24 : 28} decorative />
      <span
        className={cn(
          'font-mono font-medium uppercase tracking-[0.2em] text-ink',
          titleSize
        )}
      >
        Vocab&nbsp;Nest
      </span>
    </Link>
  )
}

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(href + '/')
}

export function Sidebar({
  isAdmin,
  nav,
}: {
  isAdmin?: boolean
  nav?: NavSummary
}) {
  const pathname = usePathname()
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-rule bg-cream lg:flex">
      <div className="flex h-16 items-center px-6">
        <Wordmark />
      </div>

      <div className="px-6">
        <Rule />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <Caps as="div" className="mb-4 text-ink-tertiary">
          Contents
        </Caps>
        <nav className="space-y-1">
          {primaryNav.map((item, i) => {
            const active = isActive(pathname, item.href)
            const due = item.href === '/practice' ? (nav?.dueToday ?? 0) : 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative grid grid-cols-[28px_1fr_auto] items-baseline gap-2 py-1.5 text-[14px] transition-colors',
                  active
                    ? 'text-ink'
                    : 'text-ink-secondary hover:text-ink'
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute -left-6 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-accent"
                  />
                )}
                <span
                  className={cn(
                    'text-right font-display text-[12px] italic',
                    active ? 'text-accent' : 'text-ink-tertiary'
                  )}
                >
                  {toRoman(i + 1)}.
                </span>
                <span className={cn('font-medium', active && 'font-semibold')}>
                  {item.label}
                </span>
                {due > 0 && (
                  <span className="self-center font-mono text-[11px] font-semibold tabular-nums text-accent">
                    {due > 99 ? '99+' : due}
                    <span className="sr-only"> due</span>
                  </span>
                )}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'relative grid grid-cols-[28px_1fr] items-baseline gap-2 py-1.5 text-[14px] transition-colors',
                isActive(pathname, '/admin')
                  ? 'text-ink'
                  : 'text-ink-secondary hover:text-ink'
              )}
            >
              {isActive(pathname, '/admin') && (
                <span
                  aria-hidden
                  className="absolute -left-6 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-accent"
                />
              )}
              <span className="text-right font-display text-[12px] italic text-ink-tertiary">
                <Shield size={12} className="inline" />
              </span>
              <span className="font-medium">Admin</span>
            </Link>
          )}
        </nav>

        <div className="mt-10">
          <Caps as="div" className="mb-3 text-ink-tertiary">
            Account
          </Caps>
          <Link
            href="/settings"
            className={cn(
              'block py-1.5 text-[14px] transition-colors',
              pathname === '/settings'
                ? 'text-ink'
                : 'text-ink-secondary hover:text-ink'
            )}
          >
            Preferences
          </Link>
          <Link
            href="/settings/billing"
            className={cn(
              'block py-1.5 text-[14px] transition-colors',
              isActive(pathname, '/settings/billing')
                ? 'text-ink'
                : 'text-ink-secondary hover:text-ink'
            )}
          >
            Billing &amp; plan
          </Link>
        </div>
      </div>

      <div className="space-y-3 border-t border-rule px-6 py-4">
        {nav && (
          <div className="flex items-baseline justify-between">
            <Caps className="text-ink-tertiary">Bound in the nest</Caps>
            <span className="font-display text-[15px] font-semibold tabular-nums text-ink">
              {nav.totalWords.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <ThemeToggle className="-mx-2 inline-flex h-9 items-center gap-2 rounded-sm px-2 text-[13px] text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink" />
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-[13px] text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink"
            aria-label="Sign out"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

function ProfileMenu({ isAdmin }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink"
        aria-label="More"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-40 mt-1 w-44 border border-rule bg-cream py-1 shadow-lg">
            <Link
              href="/groups"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-[13px] text-ink hover:bg-border-subtle"
            >
              Groups
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-ink hover:bg-border-subtle"
            >
              <Settings size={13} />
              Preferences
            </Link>
            <Link
              href="/settings/billing"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-[13px] text-ink hover:bg-border-subtle"
            >
              Billing
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-[13px] text-ink hover:bg-border-subtle"
              >
                <Shield size={13} />
                Admin
              </Link>
            )}
            <div className="my-1 border-t border-rule" />
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink hover:bg-border-subtle"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function MobileTopBar({ isAdmin }: { isAdmin?: boolean }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-rule bg-cream px-4 py-3 lg:hidden">
      <Wordmark size="sm" />
      <div className="flex items-center gap-1">
        <ThemeToggle className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink" />
        <ProfileMenu isAdmin={isAdmin} />
      </div>
    </header>
  )
}

function MobileNav({ nav }: { nav?: NavSummary }) {
  const pathname = usePathname()
  const items = primaryNav.filter((i) => i.mobile)
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-cream lg:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {items.map((item, i) => {
          const active = isActive(pathname, item.href)
          const due = item.href === '/practice' ? (nav?.dueToday ?? 0) : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 py-2.5"
              aria-label={due > 0 ? `${item.label}, ${due} due` : undefined}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 h-[2px] w-8 -translate-x-1/2 bg-accent"
                />
              )}
              <span
                className={cn(
                  'relative font-display text-[11px] italic',
                  active ? 'text-accent' : 'text-ink-tertiary'
                )}
              >
                {toRoman(i + 1)}
                {due > 0 && (
                  <span
                    aria-hidden
                    className="absolute -right-2 -top-1 h-1.5 w-1.5 rounded-full bg-accent"
                  />
                )}
              </span>
              <span
                className={cn(
                  'text-[11px] uppercase tracking-[0.12em]',
                  active
                    ? 'font-semibold text-ink'
                    : 'font-medium text-ink-secondary'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AppShell({
  children,
  isAdmin,
  nav,
}: {
  children: React.ReactNode
  isAdmin?: boolean
  nav?: NavSummary
}) {
  return (
    <div className="flex min-h-dvh bg-cream">
      <PageProgress />
      <TimeZoneSync />
      <Sidebar isAdmin={isAdmin} nav={nav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar isAdmin={isAdmin} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-28 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pb-12">
          {children}
        </main>
      </div>
      <MobileNav nav={nav} />
    </div>
  )
}
