import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getTimeZone } from '@/lib/timezone'
import { isPro } from '@/lib/data/subscription'
import { isAiConfigured } from '@/lib/ai/gemini'
import { getPracticeState } from '@/lib/data/practice'
import { startPractice } from '@/lib/actions/practice'
import { getGroupWithVocabulary } from '@/lib/data/groups'
import { Button, ButtonLink } from '@/components/ui/button'
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
  const pro = await isPro(user.id)

  if (groupId && !pro) {
    redirect('/upgrade')
  }

  const aiGrading = pro && isAiConfigured()
  const [state, groupData] = await Promise.all([
    getPracticeState(user.id, groupId, tz),
    groupId ? getGroupWithVocabulary(groupId, user.id) : null,
  ])

  const groupHeader = groupData ? (
    <Link
      href={`/groups/${groupId}`}
      className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary transition-colors hover:text-ink"
    >
      <ArrowLeft size={14} />
      {groupData.group.name}
    </Link>
  ) : null

  // An existing session is in progress — run it.
  if (state.kind === 'active') {
    return (
      <div className="space-y-6">
        {groupHeader}
        <PracticeRunner
          session={state.practice.session}
          definitions={state.practice.definitions}
          pool={state.practice.pool}
          aiGrading={aiGrading}
        />
      </div>
    )
  }

  // Words are due, but no session yet — wait for an explicit start.
  if (state.kind === 'ready') {
    const startAction = startPractice.bind(null, groupId)
    return (
      <div className="space-y-6">
        {groupHeader}
        <div className="mx-auto max-w-xl space-y-8 py-12 text-center">
          <Caps as="div">Ready to practice</Caps>
          <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink">
            {state.dueCount} word{state.dueCount === 1 ? '' : 's'} due.
          </h2>
          <Rule animate />
          <p className="font-display italic text-[17px] text-ink-secondary">
            A few minutes keeps them sharp.
          </p>
          <form action={startAction} className="flex justify-center">
            <Button type="submit" variant="accent" size="lg">
              Start practice
              <ArrowRight size={14} />
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // 'done' (finished today's session) or 'empty' (nothing due).
  return (
    <div className="mx-auto max-w-xl space-y-8 py-12 text-center">
      <Caps as="div">
        {state.kind === 'done' ? 'All done for today' : 'All caught up'}
      </Caps>
      <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink">
        Nothing due.
      </h2>
      <Rule animate />
      <p className="font-display italic text-[17px] text-ink-secondary">
        {groupData
          ? `No words in "${groupData.group.name}" are due for review.`
          : state.kind === 'done'
            ? "You've reviewed everything due today. Come back tomorrow."
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
