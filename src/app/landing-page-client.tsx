'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import { Wordmark } from '@/components/ui/wordmark'

export default function LandingPageClient() {
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {/* Running head */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <Wordmark size="md" />
        <nav className="flex items-center gap-5">
          <ThemeToggle className="inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-[13px] text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink" />
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <ButtonLink href="/register" variant="primary" size="md">
            Get started
            <ArrowRight size={13} />
          </ButtonLink>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-14 overflow-hidden px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-16">
        {/* Title page */}
        <div className="space-y-8">
          <Caps as="div" className="animate-fade-up text-accent">
            Plate No. I — A keeper of words
          </Caps>
          <h1
            className="animate-fade-up font-display text-[50px] font-semibold leading-[0.92] tracking-[-0.03em] text-ink sm:text-[72px] lg:text-[80px]"
            style={{ animationDelay: '60ms' }}
          >
            Collect words
            <br />
            like a <span className="italic text-accent">naturalist</span>
            <br />
            keeps specimens.
          </h1>
          <p
            className="animate-fade-up max-w-md font-display text-[19px] italic leading-relaxed text-ink-secondary"
            style={{ animationDelay: '120ms' }}
          >
            A calm, deliberate place to gather vocabulary, bind it into groups,
            and practise daily with spaced repetition — kept like a commonplace
            book, not a feed.
          </p>
          <div
            className="animate-fade-up flex flex-wrap items-center gap-x-6 gap-y-3"
            style={{ animationDelay: '180ms' }}
          >
            <ButtonLink href="/register" variant="primary" size="lg">
              Start your nest
              <ArrowRight size={14} />
            </ButtonLink>
            <Link
              href="/login"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink underline decoration-accent decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent-hover"
            >
              I have an account
            </Link>
          </div>
        </div>

        {/* Dictionary specimen plate */}
        <aside
          className="animate-fade-up relative"
          style={{ animationDelay: '260ms' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-20 select-none font-display text-[220px] font-semibold leading-none text-ink/[0.05] sm:text-[280px]"
          >
            S
          </span>
          <article className="leaf relative rounded-sm px-8 py-10 sm:px-10 sm:py-11">
            <div className="flex items-baseline justify-between">
              <Caps>Specimen</Caps>
              <Caps className="text-ink-tertiary">fig. 1</Caps>
            </div>
            <Rule className="my-5" />
            <h2 className="font-display text-[44px] font-semibold leading-none tracking-tight text-ink sm:text-[52px]">
              serendipity
            </h2>
            <p className="mt-3 font-mono text-[12px] lowercase tracking-wide text-ink-tertiary">
              /ˌsɛr.ənˈdɪp.ɪ.ti/ &middot; noun
            </p>
            <p className="mt-5 font-display text-[21px] italic leading-snug text-ink">
              the occurrence of events by chance, in a happy or beneficial way.
            </p>
            <Rule ornament className="my-6" />
            <p className="font-sans text-[14px] leading-relaxed text-ink-secondary">
              &ldquo;A stroke of serendipity brought the two old friends to the
              same quiet café, years and a continent apart.&rdquo;
            </p>
          </article>
        </aside>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 sm:px-10">
        <Marginalia>&copy; {year} Vocab Nest</Marginalia>
        <Caps className="text-ink-tertiary">Est. MMXXVI &middot; Made for the patient</Caps>
      </footer>
    </div>
  )
}
