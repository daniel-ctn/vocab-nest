import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, BrainCircuit } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { isPro } from '@/lib/data/subscription'
import {
  getGroupReviewSummary,
  getGroupWithVocabulary,
  listVocabularyNotInGroup,
} from '@/lib/data/groups'
import { ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import {
  Specimen,
  SpecimenBody,
  SpecimenDefinition,
  SpecimenList,
  SpecimenTerm,
} from '@/components/ui/specimen'
import { cn } from '@/lib/cn'
import { DeleteGroupButton } from './delete-group-button'
import { AddWordsToGroup } from './add-words'
import type { VocabularyEntry } from '@/lib/contracts'

const TIER_NAMES = ['Fresh', 'Familiar', 'Steady', 'Rooted'] as const
const TIER_INTENSITY = ['bg-ink/20', 'bg-ink/45', 'bg-ink/65', 'bg-ink'] as const

function DeckStat({
  label,
  value,
  hint,
  active = false,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  active?: boolean
}) {
  return (
    <div className="px-4 first:pl-0 last:pr-0 sm:px-6">
      <Caps>{label}</Caps>
      <div
        className={cn(
          'mt-1.5 font-display text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums sm:text-[32px]',
          active ? 'text-accent' : 'text-ink'
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-2 min-h-5">{hint}</div>}
    </div>
  )
}

function WordRow({ entry, due }: { entry: VocabularyEntry; due: boolean }) {
  return (
    <Specimen href={`/vocabulary/${entry.id}`}>
      <SpecimenBody>
        <div className="flex items-baseline gap-3">
          <SpecimenTerm size="sm">{entry.term}</SpecimenTerm>
          {entry.partOfSpeech && (
            <Marginalia className="shrink-0">
              {entry.partOfSpeech}.
            </Marginalia>
          )}
        </div>
        <SpecimenDefinition className="line-clamp-2">
          {entry.definition}
        </SpecimenDefinition>
      </SpecimenBody>
      {due ? (
        <span className="font-display text-[12px] italic text-accent">due</span>
      ) : (
        <span className="text-ink-tertiary">→</span>
      )}
    </Specimen>
  )
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()
  const data = await getGroupWithVocabulary(id, user.id)
  if (!data) {
    redirect('/groups')
  }

  const { group, items } = data
  const [availableWords, pro, summary] = await Promise.all([
    listVocabularyNotInGroup(id, user.id),
    isPro(user.id),
    getGroupReviewSummary(id, user.id),
  ])

  const dueSet = new Set(summary.dueIds)

  return (
    <div className="space-y-10">
      <Link
        href="/groups"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} />
        Groups
      </Link>

      <Chapter
        eyebrow={`${items.length} word${items.length !== 1 ? 's' : ''}`}
        title={group.name}
        subtitle={group.description ?? undefined}
        aside={
          <div className="flex items-center gap-3">
            {pro ? (
              <ButtonLink href={`/practice?group=${group.id}`} variant="accent">
                <BrainCircuit size={14} />
                Practice
              </ButtonLink>
            ) : (
              <ButtonLink href="/upgrade" variant="outline">
                <BrainCircuit size={14} />
                Practice (Pro)
              </ButtonLink>
            )}
            <DeleteGroupButton id={group.id} />
          </div>
        }
      />

      {availableWords.length > 0 && (
        <AddWordsToGroup groupId={group.id} words={availableWords} />
      )}

      {items.length === 0 ? (
        <div className="space-y-5 py-10 text-center">
          <Rule ornament />
          <h3 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-ink">
            An empty shelf.
          </h3>
          <p className="mx-auto max-w-sm font-display text-[16px] italic leading-relaxed text-ink-secondary">
            Add words from your collection to gather them here.
          </p>
          <div className="flex justify-center pt-1">
            <ButtonLink href="/vocabulary" variant="primary">
              Browse vocabulary
            </ButtonLink>
          </div>
          <Rule ornament />
        </div>
      ) : (
        <>
          {/* Deck summary — the group's standing at a glance */}
          <section className="space-y-5">
            <div className="grid grid-cols-3 divide-x divide-rule">
              <DeckStat label="Words" value={summary.total} />
              <DeckStat
                label="Due now"
                value={summary.dueCount}
                active={summary.dueCount > 0}
                hint={
                  <Marginalia>
                    {summary.dueCount > 0 ? 'awaiting review' : 'all caught up'}
                  </Marginalia>
                }
              />
              <DeckStat
                label="Rooted"
                value={summary.tiers[3]}
                hint={
                  <Marginalia>
                    of {summary.total} {summary.total === 1 ? 'word' : 'words'}
                  </Marginalia>
                }
              />
            </div>
            <div className="space-y-3">
              <div
                className="flex h-2 w-full overflow-hidden bg-rule"
                role="img"
                aria-label="Rooting distribution"
              >
                {summary.tiers.map((count, i) => {
                  const pct = (count / summary.total) * 100
                  if (pct <= 0) return null
                  return (
                    <div
                      key={TIER_NAMES[i]}
                      className={TIER_INTENSITY[i]}
                      style={{ width: `${pct}%` }}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {TIER_NAMES.map((name, i) => (
                  <span key={name} className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className={cn('inline-block h-2 w-2', TIER_INTENSITY[i])}
                    />
                    <Caps className="text-ink-tertiary">
                      {name} {summary.tiers[i]}
                    </Caps>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Caps as="div">Words in this group</Caps>
            <SpecimenList>
              {items.map((entry) => (
                <WordRow
                  key={entry.id}
                  entry={entry}
                  due={dueSet.has(entry.id)}
                />
              ))}
            </SpecimenList>
          </section>
        </>
      )}
    </div>
  )
}
