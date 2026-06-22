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
import { Ledger, LedgerStat } from '@/components/ui/ledger'
import { ROOTING_TIERS, ROOTING_INTENSITY } from '@/lib/rooting'
import { cn } from '@/lib/cn'
import { DeleteGroupButton } from './delete-group-button'
import { AddWordsToGroup } from './add-words'
import type { VocabularyEntry } from '@/lib/contracts'

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
            <Ledger>
              <LedgerStat label="Words" value={summary.total} />
              <LedgerStat
                label="Due now"
                value={summary.dueCount}
                active={summary.dueCount > 0}
                hint={
                  <Marginalia>
                    {summary.dueCount > 0 ? 'awaiting review' : 'all caught up'}
                  </Marginalia>
                }
              />
              <LedgerStat
                label="Rooted"
                value={summary.tiers[3]}
                hint={
                  <Marginalia>
                    of {summary.total} {summary.total === 1 ? 'word' : 'words'}
                  </Marginalia>
                }
              />
            </Ledger>
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
                      key={ROOTING_TIERS[i]}
                      className={ROOTING_INTENSITY[i]}
                      style={{ width: `${pct}%` }}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {ROOTING_TIERS.map((name, i) => (
                  <span key={name} className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className={cn('inline-block h-2 w-2', ROOTING_INTENSITY[i])}
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
