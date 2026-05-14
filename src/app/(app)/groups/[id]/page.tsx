import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, BrainCircuit } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { isPro } from '@/lib/data/subscription'
import {
  getGroupWithVocabulary,
  listVocabularyNotInGroup,
} from '@/lib/data/groups'
import { ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Marginalia } from '@/components/ui/marginalia'
import {
  Specimen,
  SpecimenBody,
  SpecimenDefinition,
  SpecimenList,
  SpecimenTerm,
} from '@/components/ui/specimen'
import { DeleteGroupButton } from './delete-group-button'
import { AddWordsToGroup } from './add-words'
import type { VocabularyEntry } from '@/lib/contracts'

function WordRow({ entry }: { entry: VocabularyEntry }) {
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
      <span className="text-ink-tertiary">→</span>
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
  const [availableWords, pro] = await Promise.all([
    listVocabularyNotInGroup(id, user.id),
    isPro(user.id),
  ])

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
        <div className="py-12 text-center">
          <div className="font-display text-5xl text-ink-tertiary">—</div>
          <p className="mt-3 font-display italic text-[15px] text-ink-tertiary">
            No words in this group yet.
          </p>
          <Link
            href="/vocabulary"
            className="mt-6 inline-block text-[13px] text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px] hover:decoration-accent-hover"
          >
            Browse vocabulary →
          </Link>
        </div>
      ) : (
        <section className="space-y-4">
          <Caps as="div">Words in this group</Caps>
          <SpecimenList>
            {items.map((entry) => (
              <WordRow key={entry.id} entry={entry} />
            ))}
          </SpecimenList>
        </section>
      )}
    </div>
  )
}
