import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getTimeZone } from '@/lib/timezone'
import { isPro } from '@/lib/data/subscription'
import { getOrCreateTodayPractice } from '@/lib/data/practice'
import { getGroupWithVocabulary } from '@/lib/data/groups'
import { ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Rule } from '@/components/ui/rule'
import { PracticeRunner } from './practice-runner'

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>
}) {
  const { group: groupId } = await searchParams
  const user = await requireUser()
  const tz = await getTimeZone()

  if (groupId) {
    const pro = await isPro(user.id)
    if (!pro) {
      redirect('/upgrade')
    }
  }

  const [today, groupData] = await Promise.all([
    getOrCreateTodayPractice(user.id, groupId, tz),
    groupId ? getGroupWithVocabulary(groupId, user.id) : null,
  ])

  if (!today) {
    return (
      <div className="mx-auto max-w-xl space-y-8 py-12 text-center">
        <Caps as="div">All caught up</Caps>
        <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink">
          Nothing due.
        </h2>
        <Rule animate />
        <p className="font-display italic text-[17px] text-ink-secondary">
          {groupData
            ? `No words in "${groupData.group.name}" are due for review.`
            : 'You have no words due today. Add more vocabulary or come back tomorrow.'}
        </p>
        {groupData ? (
          <ButtonLink href={`/groups/${groupId}`} variant="outline">
            <ArrowLeft size={14} />
            Back to {groupData.group.name}
          </ButtonLink>
        ) : (
          <ButtonLink href="/vocabulary/new" variant="primary">
            Add a word
          </ButtonLink>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groupData && (
        <Link
          href={`/groups/${groupId}`}
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} />
          {groupData.group.name}
        </Link>
      )}
      <PracticeRunner
        session={today.session}
        definitions={today.definitions}
        pool={today.pool}
      />
    </div>
  )
}
