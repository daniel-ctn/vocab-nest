import Link from 'next/link'
import { ArrowRight, BrainCircuit } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import { getOrCreateTodayPractice } from '@/lib/data/practice'
import { PracticeRunner } from './practice-runner'

export default async function PracticePage() {
  const user = await getCurrentUser()
  const today = await getOrCreateTodayPractice(user.id)

  if (!today) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-border-subtle flex items-center justify-center mb-4">
          <BrainCircuit size={28} className="text-ink-secondary" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          All caught up
        </h2>
        <p className="text-ink-secondary mt-2 max-w-sm">
          You have no words due for review today. Add more vocabulary to keep
          learning.
        </p>
        <Link
          href="/vocabulary/new"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <ArrowRight size={16} />
          Add a word
        </Link>
      </div>
    )
  }

  return (
    <PracticeRunner session={today.session} definitions={today.definitions} />
  )
}
