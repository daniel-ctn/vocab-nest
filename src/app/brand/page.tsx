'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RotateCcw, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Rule } from '@/components/ui/rule'
import { Wordmark } from '@/components/ui/wordmark'
import { LogoMark, LogoMarkAnimated } from '@/components/ui/logo'

export default function BrandPage() {
  // Bump to remount the animated marks and replay the one-shot reveal.
  const [take, setTake] = useState(0)

  return (
    <div className="min-h-dvh bg-cream">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 sm:px-10">
        <Wordmark key={`head-${take}`} size="md" href="/" />
        <div className="flex items-center gap-4">
          <ThemeToggle className="inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-[13px] text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink" />
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary transition-colors hover:text-ink"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-16 px-6 pb-24 pt-8 sm:px-10">
        {/* Title */}
        <section className="space-y-5">
          <Caps as="div" className="text-accent">
            Plate No. II — Identity
          </Caps>
          <h1 className="font-display text-[44px] font-semibold leading-[0.96] tracking-[-0.02em] text-ink sm:text-[64px]">
            The Colophon
          </h1>
          <Rule animate />
          <p className="max-w-xl font-display text-[18px] italic leading-relaxed text-ink-secondary">
            A pen-nib lays a single word — the terracotta seed — into a woven
            nest, struck inside a folio plate rule. The press-mark of a
            commonplace book, not a SaaS app icon.
          </p>
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTake((t) => t + 1)}
            >
              <RotateCcw size={13} />
              Replay the reveal
            </Button>
          </div>
        </section>

        {/* The mark, on paper and on ink */}
        <section className="space-y-5">
          <Caps as="div" className="text-ink-tertiary">
            The mark — animated
          </Caps>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center gap-5 bg-surface py-16">
              <LogoMarkAnimated key={`paper-${take}`} size={132} />
              <Caps className="text-ink-tertiary">On paper</Caps>
            </div>
            <div className="flex flex-col items-center justify-center gap-5 bg-ink py-16">
              <LogoMarkAnimated
                key={`ink-${take}`}
                size={132}
                className="text-cream"
              />
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-cream/60">
                On ink
              </span>
            </div>
          </div>
          <p className="font-display text-[15px] italic text-ink-secondary">
            The plate rules itself on, the nib and nest settle, and the word
            drops last with a soft letterpress press — once, then still. Honors{' '}
            <span className="text-ink">prefers-reduced-motion</span> by showing
            the finished mark with no motion.
          </p>
        </section>

        {/* Horizontal lockup */}
        <section className="space-y-5">
          <Caps as="div" className="text-ink-tertiary">
            The lockup
          </Caps>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border sm:grid-cols-2">
            <div className="flex items-center justify-center bg-surface px-8 py-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo.svg"
                alt="Vocab Nest"
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center justify-center bg-ink px-8 py-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-dark.svg"
                alt="Vocab Nest"
                className="h-12 w-auto"
              />
            </div>
          </div>
        </section>

        {/* In context */}
        <section className="space-y-5">
          <Caps as="div" className="text-ink-tertiary">
            In context
          </Caps>
          <div className="space-y-6">
            {/* Faux navbar */}
            <div className="flex items-center justify-between rounded-sm border border-border bg-surface px-5 py-3">
              <Wordmark key={`nav-${take}`} size="md" href="/brand" />
              <nav className="hidden items-center gap-6 sm:flex">
                {['Dashboard', 'Vocabulary', 'Practice'].map((l) => (
                  <span
                    key={l}
                    className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary"
                  >
                    {l}
                  </span>
                ))}
              </nav>
            </div>

            {/* Faux browser tab */}
            <div className="flex max-w-sm items-center gap-2.5 rounded-t-md border border-border border-b-0 bg-surface px-3 py-2">
              <LogoMark size={16} decorative />
              <span className="flex-1 truncate text-[12px] text-ink-secondary">
                Vocab Nest — a commonplace book for words
              </span>
              <X size={12} className="text-ink-tertiary" />
            </div>
          </div>
        </section>

        {/* Favicon construction */}
        <section className="space-y-5">
          <Caps as="div" className="text-ink-tertiary">
            Favicon — static, never animated
          </Caps>
          <div className="flex flex-wrap items-end gap-8 rounded-sm border border-border bg-surface px-8 py-10">
            {[16, 24, 32, 48].map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <LogoMark size={s} decorative />
                <span className="font-mono text-[10px] tabular-nums text-ink-tertiary">
                  {s}px
                </span>
              </div>
            ))}
            <div className="ml-auto flex items-end gap-8">
              <div className="flex flex-col items-center gap-3">
                <LogoMark size={48} className="text-ink-tertiary" decorative />
                <Caps className="text-ink-tertiary">Mono</Caps>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-sm bg-ink">
                  <LogoMark size={32} className="text-cream" decorative />
                </div>
                <Caps className="text-ink-tertiary">Reversed</Caps>
              </div>
            </div>
          </div>
        </section>

        {/* Usage */}
        <section className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border sm:grid-cols-2">
          <div className="space-y-3 bg-surface p-7">
            <Caps className="text-accent">Animate</Caps>
            <ul className="space-y-1.5 font-sans text-[14px] leading-relaxed text-ink-secondary">
              <li>Header &amp; sidebar wordmark (one-shot on mount)</li>
              <li>Landing hero &amp; auth screens</li>
              <li>This brand sheet</li>
            </ul>
          </div>
          <div className="space-y-3 bg-surface p-7">
            <Caps className="text-ink-tertiary">Keep still</Caps>
            <ul className="space-y-1.5 font-sans text-[14px] leading-relaxed text-ink-secondary">
              <li>Favicon, browser tab, app icons</li>
              <li>Open Graph &amp; social cards</li>
              <li>Loading marks &amp; dense, repeated instances</li>
            </ul>
          </div>
        </section>

        <footer className="flex items-center justify-between pt-4">
          <Caps className="text-ink-tertiary">Est. MMXXVI</Caps>
          <Caps className="text-ink-tertiary">Ink on cream · one seed of terracotta</Caps>
        </footer>
      </main>
    </div>
  )
}
