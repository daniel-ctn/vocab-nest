import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getDashboardSummary, getDueWordsPreview } from '@/lib/data/dashboard'
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
import { TallyMarks } from '@/components/ui/tally-marks'
import { ButtonLink } from '@/components/ui/button'
import { toRoman } from '@/components/ui/roman'

function weekdayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: 'long' })
}

export default async function DashboardPage() {
  const user = await requireUser()
  const [stats, dueWords] = await Promise.all([
    getDashboardSummary(user.id),
    getDueWordsPreview(user.id, 3),
  ])

  const hasDue = stats.dueToday > 0
  const remainingGoal = Math.max(0, stats.dailyGoal - stats.reviewedToday)
  const goalPct = Math.min(
    100,
    Math.round((stats.reviewedToday / Math.max(1, stats.dailyGoal)) * 100)
  )
  const goalMet = stats.reviewedToday >= stats.dailyGoal

  return (
    <div className="space-y-12">
      <Chapter
        eyebrow={`Chapter ${toRoman(1)} — ${weekdayLabel()}`}
        title="Dashboard"
        subtitle={
          hasDue
            ? `${stats.dueToday} word${stats.dueToday > 1 ? 's' : ''} await review.`
            : 'Nothing due. Add a word or browse what you have.'
        }
        aside={
          hasDue ? (
            <ButtonLink href="/practice" variant="accent" size="lg">
              Start practice
              <ArrowRight size={14} />
            </ButtonLink>
          ) : (
            <ButtonLink href="/vocabulary/new" variant="primary" size="lg">
              Add a word
            </ButtonLink>
          )
        }
      />

      {/* Ledger of headline stats */}
      <section>
        <StatRow cols={3}>
          <Stat
            value={stats.totalVocabulary.toLocaleString()}
            label="Words in your nest"
            hint={
              stats.totalGroups > 0
                ? `across ${stats.totalGroups} group${stats.totalGroups > 1 ? 's' : ''}`
                : undefined
            }
          />
          <Stat
            value={stats.streakDays}
            label="Day streak"
            active={stats.streakDays > 0}
            hint={
              stats.streakDays > 0 ? (
                <TallyMarks count={stats.streakDays} />
              ) : (
                'no streak yet'
              )
            }
          />
          <Stat
            value={stats.dueToday}
            label="Due today"
            active={hasDue}
            hint={hasDue ? 'awaiting review' : 'all caught up'}
          />
        </StatRow>
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
