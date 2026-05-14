'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, X } from 'lucide-react'
import { completePractice, reviewPracticeItem } from '@/lib/actions/practice'
import { SpeakButton } from '@/components/speak-button'
import { Button, ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Rule } from '@/components/ui/rule'
import { TallyMarks } from '@/components/ui/tally-marks'
import { cn } from '@/lib/cn'
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
  const [kept, setKept] = useState(0)
  const [isPending, startTransition] = useTransition()

  const item = session.items[currentIndex]

  function handleReview(remembered: boolean) {
    if (!item || isPending) return
    startTransition(async () => {
      try {
        await reviewPracticeItem(session.id, item.id, { remembered })
        if (remembered) setKept((n) => n + 1)
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
    const total = session.items.length
    const lost = total - kept
    return (
      <div className="mx-auto max-w-xl space-y-10 py-12 text-center">
        <Caps as="div">Session complete</Caps>
        <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink">
          The ink is dry.
        </h2>
        <Rule animate />
        <div className="flex items-end justify-center gap-12">
          <div className="flex flex-col items-center gap-2">
            <div className="font-display text-6xl font-semibold leading-none text-ink">
              {kept}
            </div>
            <Caps>Kept</Caps>
            <TallyMarks count={kept} />
          </div>
          <div className="self-stretch w-px bg-rule" />
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'font-display text-6xl font-semibold leading-none',
                lost > 0 ? 'text-ink-tertiary' : 'text-ink-tertiary'
              )}
            >
              {lost}
            </div>
            <Caps>Lost</Caps>
            <TallyMarks count={lost} />
          </div>
        </div>
        <p className="font-display italic text-[16px] text-ink-secondary">
          {kept === total
            ? 'A perfect copy.'
            : lost === total
              ? 'Nothing sticks the first time. Try again soon.'
              : 'Steady work.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => router.refresh()} variant="primary">
            Practice again
          </Button>
          <ButtonLink href="/dashboard" variant="outline">
            To dashboard
          </ButtonLink>
        </div>
      </div>
    )
  }

  if (!item) return null

  const progress = ((currentIndex + (revealed ? 0.5 : 0)) / session.items.length) * 100
  const definition = definitions[item.vocabularyId] ?? 'Definition not found'

  return (
    <div className="mx-auto max-w-xl space-y-8">
      {/* Progress — hairline with a moving bookmark */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Caps as="div">
            Card {currentIndex + 1} of {session.items.length}
          </Caps>
          <span className="font-display text-[12px] italic text-ink-tertiary tabular-nums">
            {kept} kept · {currentIndex - kept} lost
          </span>
        </div>
        <div className="relative h-px w-full bg-rule">
          <div
            className="absolute inset-y-0 left-0 bg-ink transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute -top-1 h-3 w-[2px] bg-accent transition-all duration-500"
            style={{ left: `calc(${progress}% - 1px)` }}
          />
        </div>
      </div>

      {/* Paper card with 3D flip */}
      <div className="perspective-1200">
        <div
          className={cn(
            'relative min-h-[280px] w-full preserve-3d transition-transform duration-[450ms]',
            revealed && 'rotate-y-180'
          )}
          style={{ transitionTimingFunction: 'var(--ease-paper)' }}
        >
          {/* Front: term */}
          <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-6 bg-surface px-6 py-12 shadow-[0_10px_28px_-18px_rgba(20,15,10,0.22)] outline outline-1 outline-rule">
            <Caps>Do you remember</Caps>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-4xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-5xl">
                {item.term}
              </h2>
              <SpeakButton
                text={item.term}
                className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink"
              />
            </div>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mt-2 text-[13px] text-ink underline decoration-accent decoration-[1.5px] underline-offset-[6px] hover:decoration-accent-hover"
            >
              Turn the card →
            </button>
          </div>

          {/* Back: definition */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col gap-6 bg-surface px-6 py-10 shadow-[0_10px_28px_-18px_rgba(20,15,10,0.22)] outline outline-1 outline-rule">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-ink">
                {item.term}
              </h3>
              <SpeakButton
                text={item.term}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-ink-tertiary transition-colors hover:bg-border-subtle hover:text-ink"
              />
            </div>
            <Rule />
            <p className="flex-1 font-display text-[20px] italic leading-snug text-ink">
              {definition}
            </p>
            <Rule />
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleReview(false)}
                disabled={isPending}
                variant="outline"
                size="lg"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                Lost
              </Button>
              <Button
                onClick={() => handleReview(true)}
                disabled={isPending}
                variant="primary"
                size="lg"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Kept
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
