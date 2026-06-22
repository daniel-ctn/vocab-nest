import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getTimeZone } from '@/lib/timezone'
import { isPro } from '@/lib/data/subscription'
import { getLearningStats } from '@/lib/data/stats'
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
import { cn } from '@/lib/cn'
// The four mastery tiers, shared with the group and word-detail views.
import {
  ROOTING_TIERS as TIER_NAMES,
  ROOTING_INTENSITY as TIER_INTENSITY,
} from '@/lib/rooting'

function heatClass(count: number): string {
  if (count <= 0) return 'bg-rule/40'
  if (count <= 2) return 'bg-ink/25'
  if (count <= 5) return 'bg-ink/50'
  return 'bg-ink'
}

/**
 * Review forecast as a composed chart: a bar per day for the words coming due,
 * plus a hairline cumulative line tracing how the backlog accumulates over the
 * fortnight. Drawn in SVG so the two series share one baseline; day labels are
 * rendered as HTML below so they stay legible at every width.
 */
function ForecastChart({
  upcoming,
}: {
  upcoming: { date: string; count: number }[]
}) {
  const n = upcoming.length
  const counts = upcoming.map((d) => d.count)
  const maxDaily = Math.max(...counts, 1)
  const cumulative: number[] = []
  counts.reduce((acc, c, i) => (cumulative[i] = acc + c), 0)
  const total = cumulative[n - 1] || 1

  const W = 700
  const H = 180
  const padTop = 14
  const padBottom = 10
  const plotH = H - padTop - padBottom
  const baseY = padTop + plotH
  const slot = W / n
  const barW = Math.min(slot * 0.46, 16)

  const cx = (i: number) => (i + 0.5) * slot
  const lineY = (i: number) => baseY - (cumulative[i] / total) * plotH
  const linePath = upcoming
    .map(
      (_, i) =>
        `${i === 0 ? 'M' : 'L'} ${cx(i).toFixed(1)} ${lineY(i).toFixed(1)}`
    )
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Review forecast: ${total} words coming due over the next ${n} days`}
    >
      <line
        x1={0}
        y1={baseY}
        x2={W}
        y2={baseY}
        className="stroke-rule"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {upcoming.map((d, i) => {
        const h = (d.count / maxDaily) * plotH
        const isToday = i === 0
        return (
          <g key={d.date}>
            <title>{`${d.date}: ${d.count} due · ${cumulative[i]} cumulative`}</title>
            {d.count > 0 && (
              <rect
                x={cx(i) - barW / 2}
                y={baseY - h}
                width={barW}
                height={h}
                className={isToday ? 'fill-accent' : 'fill-ink opacity-80'}
              />
            )}
          </g>
        )
      })}
      <path
        d={linePath}
        className="fill-none stroke-accent"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={cx(0)} cy={lineY(0)} r={3} className="fill-accent" />
      <circle
        cx={cx(n - 1)}
        cy={lineY(n - 1)}
        r={3}
        className="fill-accent"
      />
    </svg>
  )
}

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
  const upcomingTotal = stats.forecast.upcoming.reduce(
    (s, d) => s + d.count,
    0
  )
  const unlocked = stats.achievements.filter((a) => a.achieved).length

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

      {/* Activity heatmap — 16 weeks */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <Caps as="div">Activity</Caps>
          <span className="font-display text-[13px] italic text-ink-tertiary">
            last 16 weeks
          </span>
        </div>
        <Rule />
        <div
          className="grid grid-flow-col grid-rows-7 gap-[3px]"
          role="img"
          aria-label="Daily review activity over the last 16 weeks"
        >
          {stats.heatmap.map((day) => (
            <div
              key={day.date}
              className={`h-3 w-3 rounded-[2px] ${heatClass(day.count)}`}
              title={`${day.date}: ${day.count} review${day.count !== 1 ? 's' : ''}`}
            />
          ))}
        </div>
      </section>

      {/* Review forecast */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <Caps as="div">Review forecast</Caps>
          <span className="font-display text-[13px] italic text-ink-tertiary">
            {stats.forecast.dueIn7} due this week · {stats.forecast.dueIn30} this
            month
          </span>
        </div>
        <Rule />
        <div className="space-y-2">
          <ForecastChart upcoming={stats.forecast.upcoming} />
          <div className="flex w-full">
            {stats.forecast.upcoming.map((day, i) => {
              const [, , dd] = day.date.split('-')
              const isToday = i === 0
              return (
                <span
                  key={day.date}
                  className={cn(
                    'flex-1 text-center font-display text-[10px] italic tabular-nums',
                    isToday ? 'text-accent' : 'text-ink-tertiary'
                  )}
                >
                  {isToday ? 'Today' : Number(dd)}
                </span>
              )
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2.5 w-1.5 bg-ink opacity-80"
            />
            <Caps className="text-ink-tertiary">due each day</Caps>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-px w-4 bg-accent" />
            <Caps className="text-ink-tertiary">
              running total · {upcomingTotal}
            </Caps>
          </span>
        </div>
      </section>

      {/* Milestones */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <Caps as="div">Milestones</Caps>
          <span className="font-display text-[13px] italic text-ink-tertiary">
            {unlocked} of {stats.achievements.length}
            {stats.longestStreak > 0 &&
              ` · longest streak ${stats.longestStreak}d`}
          </span>
        </div>
        <Rule />
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {stats.achievements.map((a) => (
            <div
              key={a.label}
              className="flex items-baseline gap-2"
              title={a.hint}
            >
              <span
                aria-hidden
                className={`inline-block h-2 w-2 rounded-full ${
                  a.achieved ? 'bg-accent' : 'bg-rule'
                }`}
              />
              <span
                className={
                  a.achieved
                    ? 'text-[13px] font-medium text-ink'
                    : 'text-[13px] text-ink-tertiary'
                }
              >
                {a.label}
              </span>
            </div>
          ))}
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
