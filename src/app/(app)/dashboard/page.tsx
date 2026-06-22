import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getTimeZone } from '@/lib/timezone'
import { getDashboardSummary, getDueWordsPreview } from '@/lib/data/dashboard'
import { Caps } from '@/components/ui/caps'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import {
  Specimen,
  SpecimenBody,
  SpecimenDefinition,
  SpecimenList,
  SpecimenTerm,
} from '@/components/ui/specimen'
import { TallyMarks } from '@/components/ui/tally-marks'
import { ButtonLink } from '@/components/ui/button'
import { toRoman } from '@/components/ui/roman'
import { Ledger, LedgerStat } from '@/components/ui/ledger'

export default async function DashboardPage() {
  const user = await requireUser()
  const tz = await getTimeZone()
  const [stats, dueWords] = await Promise.all([
    getDashboardSummary(user.id, tz),
    getDueWordsPreview(user.id, 3),
  ])

  const hasDue = stats.dueToday > 0
  const isEmpty = stats.totalVocabulary === 0
  const remainingGoal = Math.max(0, stats.dailyGoal - stats.reviewedToday)
  const goalPct = Math.min(
    100,
    Math.round((stats.reviewedToday / Math.max(1, stats.dailyGoal)) * 100)
  )
  const goalMet = stats.reviewedToday >= stats.dailyGoal

  const now = new Date()
  const weekday = now.toLocaleDateString(undefined, { weekday: 'long' })
  const datePart = now.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-12">
      {/* Frontispiece — the day's page */}
      <header className="space-y-5">
        <div className="flex animate-fade-up flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em]">
          <span className="text-accent">Chapter {toRoman(1)}</span>
          <span aria-hidden className="text-rule">
            ·
          </span>
          <span className="text-ink-tertiary">
            {weekday}, {datePart}
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="animate-fade-up font-display text-[40px] font-semibold leading-[0.96] tracking-[-0.02em] text-ink sm:text-[56px] lg:text-[60px]">
            {hasDue ? (
              <>
                <span className="text-accent tabular-nums">
                  {stats.dueToday}
                </span>{' '}
                {stats.dueToday === 1 ? 'word' : 'words'}{' '}
                <span className="text-ink-secondary">await review.</span>
              </>
            ) : isEmpty ? (
              <>
                Your nest is{' '}
                <span className="text-ink-secondary">empty.</span>
              </>
            ) : (
              <>
                Nothing due.{' '}
                <span className="text-ink-secondary">The day is yours.</span>
              </>
            )}
          </h1>
          <div className="shrink-0 animate-fade-up">
            {hasDue ? (
              <ButtonLink href="/practice" variant="accent" size="lg">
                Start practice
                <ArrowRight size={14} />
              </ButtonLink>
            ) : (
              <ButtonLink href="/vocabulary/new" variant="primary" size="lg">
                Add a word
              </ButtonLink>
            )}
          </div>
        </div>
        <Rule animate />
      </header>

      {/* The day's ledger — secondary figures, run-in with hairlines */}
      <section>
        <Ledger>
          <LedgerStat
            size="lg"
            label="Day streak"
            value={stats.streakDays}
            active={stats.streakDays > 0}
            hint={
              stats.streakDays > 0 ? (
                <TallyMarks count={stats.streakDays} />
              ) : (
                <Marginalia>no streak yet</Marginalia>
              )
            }
          />
          <LedgerStat
            size="lg"
            label="In the nest"
            value={stats.totalVocabulary.toLocaleString()}
            hint={
              <Marginalia>
                {stats.totalGroups > 0
                  ? `across ${stats.totalGroups} group${stats.totalGroups > 1 ? 's' : ''}`
                  : 'words collected'}
              </Marginalia>
            }
          />
          <LedgerStat
            size="lg"
            label="Reviewed today"
            value={stats.reviewedToday}
            hint={<Marginalia>of {stats.dailyGoal} goal</Marginalia>}
          />
        </Ledger>
      </section>

      {/* Daily goal — a hairline track with a bookmark ribbon */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <Caps as="div">Daily goal</Caps>
          <span className="font-display text-[14px] text-ink-secondary tabular-nums">
            {Math.min(stats.reviewedToday, stats.dailyGoal)} /{' '}
            {stats.dailyGoal}
          </span>
        </div>
        <div className="relative h-px w-full bg-rule">
          <div
            className="absolute inset-y-0 left-0 bg-ink"
            style={{ width: `${goalPct}%` }}
          />
          {/* Bookmark ribbon */}
          <div
            className="absolute -top-1 h-3 w-[2px] bg-accent transition-all duration-500"
            style={{
              left: `calc(${goalPct}% - 1px)`,
            }}
          />
        </div>
        <Marginalia>
          {goalMet
            ? 'Goal met. The day is yours.'
            : `${remainingGoal} more to keep the streak.`}
        </Marginalia>
      </section>

      {/* Due-today specimens */}
      {hasDue && (
        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <Caps as="div">Due today</Caps>
            <Link
              href="/practice"
              className="text-[12px] text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px] hover:decoration-accent-hover"
            >
              Practice {stats.dueToday > dueWords.length
                ? `all ${stats.dueToday}`
                : 'now'}{' '}
              →
            </Link>
          </div>
          <Rule />
          <SpecimenList>
            {dueWords.map((w) => (
              <Specimen key={w.id} href={`/vocabulary/${w.id}`}>
                <SpecimenBody>
                  <div className="flex items-baseline gap-3">
                    <SpecimenTerm>{w.term}</SpecimenTerm>
                    {w.partOfSpeech && (
                      <Marginalia className="hidden sm:inline">
                        {w.partOfSpeech}.
                      </Marginalia>
                    )}
                  </div>
                  <SpecimenDefinition>{w.definition}</SpecimenDefinition>
                </SpecimenBody>
                <span className="font-display text-[12px] italic text-accent">
                  due
                </span>
              </Specimen>
            ))}
          </SpecimenList>
        </section>
      )}

      {/* Quick links */}
      <section className="space-y-4">
        <Caps as="div">Elsewhere</Caps>
        <Rule />
        <SpecimenList>
          <Specimen href="/vocabulary/new">
            <SpecimenBody>
              <SpecimenTerm size="sm">Add a new word</SpecimenTerm>
              <SpecimenDefinition>
                Collect another for the book.
              </SpecimenDefinition>
            </SpecimenBody>
            <span className="text-ink-tertiary">→</span>
          </Specimen>
          <Specimen href="/groups">
            <SpecimenBody>
              <SpecimenTerm size="sm">Organise into groups</SpecimenTerm>
              <SpecimenDefinition>
                Keep kindred words together.
              </SpecimenDefinition>
            </SpecimenBody>
            <span className="text-ink-tertiary">→</span>
          </Specimen>
        </SpecimenList>
      </section>
    </div>
  )
}
