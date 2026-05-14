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
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 sm:px-10">
        <Wordmark size="md" />
        <div className="flex items-center gap-5">
          <ThemeToggle className="inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-[13px] text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink" />
          <Link
            href="/login"
            className="text-[13px] text-ink-secondary transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <ButtonLink href="/register" variant="primary" size="md">
            Get started
            <ArrowRight size={13} />
          </ButtonLink>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <div className="space-y-10">
          <Caps as="div">A vocabulary keeper, est. 2026</Caps>
          <h1 className="font-display text-[44px] font-semibold leading-[1.02] tracking-tight text-ink sm:text-[68px] lg:text-[84px]">
            Build your vocabulary,
            <br />
            <span className="italic">one word at a time.</span>
          </h1>
          <Rule animate />
          <p className="max-w-xl font-display text-[19px] italic leading-relaxed text-ink-secondary">
            A calm, deliberate space to collect words, organise them into
            groups, and practise daily — kept like a commonplace book, not a
            feed.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/register" variant="primary" size="lg">
              Start your nest
              <ArrowRight size={14} />
            </ButtonLink>
            <Link
              href="/login"
              className="text-[14px] text-ink underline decoration-accent decoration-[1.5px] underline-offset-[6px] hover:decoration-accent-hover"
            >
              I already have an account
            </Link>
          </div>
        </div>

        {/* Specimen — show, don't tell */}
        <div className="mt-20 max-w-2xl">
          <Caps as="div" className="mb-4">
            From the workshop
          </Caps>
          <Rule />
          <div className="mt-6 grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1">
            <Marginalia>n.</Marginalia>
            <h2 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              serendipity
            </h2>
            <div />
            <p className="font-display italic text-[18px] leading-snug text-ink-secondary sm:text-[20px]">
              the occurrence of events by chance in a happy way.
            </p>
          </div>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8 sm:px-10">
        <Marginalia>© {new Date().getFullYear()} Vocab Nest</Marginalia>
        <Marginalia>Made for the patient</Marginalia>
      </footer>
    </div>
  )
}
