import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getTimeZone } from '@/lib/timezone'
import { isPro } from '@/lib/data/subscription'
import { getLearningStats } from '@/lib/data/stats'
import { dayOfWeekFromKey } from '@/lib/date'
import { ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import { Stat, StatRow } from '@/components/ui/stat'
import {
  Specimen,
  SpecimenBody,
  SpecimenDefinition,
  SpecimenList,
  SpecimenTerm,
} from '@/components/ui/specimen'
import { toRoman } from '@/components/ui/roman'

// Bookbinder rename of the four mastery tiers (index-aligned with data).
const TIER_NAMES = ['Fresh', 'Familiar', 'Steady', 'Rooted'] as const
const TIER_INTENSITY = [
  'bg-ink/15',
  'bg-ink/35',
  'bg-ink/60',
  'bg-ink',
] as const

export default async function StatsPage() {
  const user = await requireUser()
  const pro = await isPro(user.id)

  if (!pro) {
    return (
      <div className="mx-auto max-w-xl space-y-8 py-16 text-center">
        <Caps as="div">Pro feature</Caps>
        <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink">
          A deeper read.
        </h2>
        <Rule animate />
        <p className="font-display italic text-[17px] text-ink-secondary">
          Advanced stats and insights live on the Pro plan.
        </p>
        <ButtonLink href="/upgrade" variant="accent" size="lg">
          Upgrade to Pro
        </ButtonLink>
      </div>
    )
  }

  const tz = await getTimeZone()
  const stats = await getLearningStats(user.id, tz)
  const totalMastery = stats.masteryDistribution.reduce(
    (s, b) => s + b.count,
    0
  )
  const maxActivity = Math.max(...stats.recentActivity.map((d) => d.count), 1)
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="space-y-12">
      <Chapter
        eyebrow={`Part ${toRoman(5)}`}
        title="Stats"
        subtitle="A reading of your progress."
      />

      {/* Headline ledger */}
      <section>
        <StatRow cols={3}>
          <Stat
            value={stats.totalVocabulary.toLocaleString()}
            label="Total words"
          />
          <Stat
            value={stats.dueToday}
            label="Due today"
            active={stats.dueToday > 0}
          />
          <Stat
            value={`${stats.overallAccuracy}%`}
            label="Accuracy"
            hint={
              stats.overallAccuracy >= 80
                ? 'a steady hand'
                : stats.overallAccuracy >= 60
                  ? 'finding your feet'
                  : stats.overallAccuracy > 0
                    ? 'rough waters'
                    : undefined
            }
          />
        </StatRow>
      </section>

      {/* Mastery — specimen strip */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <Caps as="div">Mastery</Caps>
          <span className="font-display text-[13px] italic text-ink-tertiary">
            {totalMastery} word{totalMastery !== 1 ? 's' : ''} tracked
          </span>
        </div>
        <Rule />
        {totalMastery === 0 ? (
          <Marginalia>
            Start practicing to see your mastery distribution.
          </Marginalia>
        ) : (
          <div className="space-y-4">
            {/* Horizontal stacked specimen strip */}
            <div
              className="flex h-2 w-full overflow-hidden bg-rule"
              role="img"
              aria-label="Mastery distribution"
            >
              {stats.masteryDistribution.map((bucket, i) => {
                const pct = (bucket.count / totalMastery) * 100
                if (pct <= 0) return null
                return (
                  <div
                    key={bucket.label}
                    className={TIER_INTENSITY[i]}
                    style={{ width: `${pct}%` }}
                  />
                )
              })}
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {stats.masteryDistribution.map((bucket, i) => {
                const pct =
                  totalMastery > 0
                    ? Math.round((bucket.count / totalMastery) * 100)
                    : 0
                return (
                  <div key={bucket.label} className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span
                        aria-hidden
                        className={`inline-block h-2 w-2 ${TIER_INTENSITY[i]}`}
                      />
                      <Caps>{TIER_NAMES[i]}</Caps>
                    </div>
                    <dd className="font-display text-[28px] font-semibold leading-none tabular-nums text-ink">
                      {bucket.count}
                    </dd>
                    <Marginalia>{pct}%</Marginalia>
                  </div>
                )
              })}
            </dl>
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section className="space-y-5">
        <Caps as="div">Recent activity</Caps>
        <Rule />
        <div className="flex items-end gap-1.5 h-28">
          {stats.recentActivity.map((day) => {
            const pct = Math.round((day.count / maxActivity) * 100)
            const [, mm, dd] = day.date.split('-')
            const label = `${Number(mm)}/${Number(dd)}`
            const hasActivity = day.count > 0
            return (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-2"
                title={`${label}: ${day.count} review${day.count !== 1 ? 's' : ''}`}
              >
                <div className="relative w-full flex-1 bg-rule">
                  <div
                    className={`absolute bottom-0 left-0 right-0 transition-all ${
                      hasActivity ? 'bg-ink' : 'bg-transparent'
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-ink-tertiary">
                  {dayLabels[dayOfWeekFromKey(day.date)]}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Weak words */}
      <section className="space-y-4">
        <Caps as="div">Words that slip</Caps>
        <Rule />
        {stats.weakWords.length === 0 ? (
          <Marginalia>No struggling words right now. Steady.</Marginalia>
        ) : (
          <SpecimenList>
            {stats.weakWords.map((word) => (
              <Specimen key={word.id} href={`/vocabulary/${word.id}`}>
                <SpecimenBody>
                  <SpecimenTerm size="sm">{word.term}</SpecimenTerm>
                  <SpecimenDefinition className="line-clamp-1">
                    {word.definition}
                  </SpecimenDefinition>
                </SpecimenBody>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="font-display text-[22px] font-semibold leading-none tabular-nums text-accent">
                    {word.accuracy}%
                  </span>
                  <Marginalia>
                    {word.totalReviews} review
                    {word.totalReviews !== 1 ? 's' : ''}
                  </Marginalia>
                </div>
              </Specimen>
            ))}
          </SpecimenList>
        )}
      </section>

      <div className="flex justify-center pt-4">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-[14px] text-ink underline decoration-accent decoration-[1.5px] underline-offset-[6px] hover:decoration-accent-hover"
        >
          Keep practicing
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
