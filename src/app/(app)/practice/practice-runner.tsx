'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, X, PartyPopper, RotateCcw } from 'lucide-react'
import { completePractice, reviewPracticeItem } from '@/lib/actions/practice'
import type { PracticeSession } from '@/lib/contracts'

export function PracticeRunner({
  session,
  definitions,
}: {
  session: PracticeSession
  definitions: Record<string, string>
}) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const item = session.items[currentIndex]

  function handleReview(remembered: boolean) {
    if (!item || isPending) return
    startTransition(async () => {
      try {
        await reviewPracticeItem(session.id, item.id, { remembered })
        if (currentIndex + 1 >= session.items.length) {
          await completePractice(session.id)
          setCompleted(true)
        } else {
          setCurrentIndex((i) => i + 1)
          setRevealed(false)
        }
      } catch {
        alert('Failed to submit review')
      }
    })
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-success-subtle flex items-center justify-center mb-4">
          <PartyPopper size={28} className="text-success" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Session complete
        </h2>
        <p className="text-ink-secondary mt-2 max-w-sm">
          Great job! You reviewed {session.items.length} word
          {session.items.length > 1 ? 's' : ''} today.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <RotateCcw size={16} />
            Practice again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-ink-secondary hover:bg-border-subtle transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!item) return null

  const progress = (currentIndex / session.items.length) * 100
  const definition = definitions[item.vocabularyId] ?? 'Definition not found'

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-ink-secondary mb-2">
          <span>
            Card {currentIndex + 1} of {session.items.length}
          </span>
          <span>{Math.round(progress)}% done</span>
        </div>
        <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border text-center">
        <div className="text-sm text-ink-secondary mb-4 uppercase tracking-wide font-medium">
          Do you remember this word?
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-6">
          {item.term}
        </h2>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Reveal definition
          </button>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-cream border border-border text-left">
              <div className="text-xs text-ink-tertiary uppercase tracking-wide font-medium mb-1">
                Definition
              </div>
              <p className="text-ink">{definition}</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handleReview(false)}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-error-subtle text-error text-sm font-medium hover:bg-error/10 transition-colors disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <X size={16} />
                )}
                Forgot
              </button>
              <button
                onClick={() => handleReview(true)}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success-subtle text-success text-sm font-medium hover:bg-success/10 transition-colors disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Remembered
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
