'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { completePractice, reviewPracticeItem } from '@/lib/actions/practice'
import { SpeakButton } from '@/components/speak-button'
import { Button, ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Rule } from '@/components/ui/rule'
import { TallyMarks } from '@/components/ui/tally-marks'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/cn'
import type { PracticeSession } from '@/lib/contracts'

type Mode = 'flashcard' | 'typed' | 'choice' | 'reverse' | 'listening'

const MODES: { id: Mode; label: string }[] = [
  { id: 'flashcard', label: 'Flashcard' },
  { id: 'typed', label: 'Type' },
  { id: 'choice', label: 'Choice' },
  { id: 'reverse', label: 'Reverse' },
  { id: 'listening', label: 'Listen' },
]

const GRADES: { grade: 0 | 1 | 2 | 3; label: string; key: string }[] = [
  { grade: 0, label: 'Again', key: '1' },
  { grade: 1, label: 'Hard', key: '2' },
  { grade: 2, label: 'Good', key: '3' },
  { grade: 3, label: 'Easy', key: '4' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function PracticeRunner({
  session,
  definitions,
  pool,
}: {
  session: PracticeSession
  definitions: Record<string, string>
  pool: { term: string; definition: string }[]
}) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('flashcard')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [kept, setKept] = useState(0)
  const [isPending, startTransition] = useTransition()

  const item = session.items[currentIndex]
  const definition = item ? (definitions[item.vocabularyId] ?? '') : ''

  // Multiple-choice options: the correct definition plus distractors.
  const options = useMemo(() => {
    if (!item) return []
    const distractors = shuffle(
      pool.filter((p) => p.definition !== definition).map((p) => p.definition)
    ).slice(0, 3)
    return shuffle([definition, ...distractors])
  }, [item, definition, pool])

  function resetCard() {
    setRevealed(false)
    setTypedAnswer('')
    setPicked(null)
  }

  const submitGrade = useCallback(
    (grade: 0 | 1 | 2 | 3) => {
      if (!item || isPending) return
      const answer = mode === 'typed' ? typedAnswer.trim() : undefined
      startTransition(async () => {
        try {
          await reviewPracticeItem(session.id, item.id, {
            grade,
            answer: answer || undefined,
          })
          if (grade >= 2) setKept((n) => n + 1)
          if (currentIndex + 1 >= session.items.length) {
            await completePractice(session.id)
            setCompleted(true)
          } else {
            setCurrentIndex((i) => i + 1)
            resetCard()
          }
        } catch {
          alert('Failed to submit review')
        }
      })
    },
    [item, isPending, mode, typedAnswer, session.id, session.items.length, currentIndex]
  )

  function pickOption(opt: string) {
    if (picked || isPending) return
    setPicked(opt)
    // Correct selection grades as Good, an incorrect one as Again.
    setTimeout(() => submitGrade(opt === definition ? 2 : 0), 700)
  }

  // Keyboard shortcuts: Space reveals, 1–4 grade (or pick in choice mode).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA'

      if (e.code === 'Space' && !typing) {
        if (mode !== 'choice' && !revealed) {
          e.preventDefault()
          setRevealed(true)
        }
        return
      }
      if (mode === 'choice') {
        const n = Number(e.key)
        if (n >= 1 && n <= options.length && !picked) {
          pickOption(options[n - 1])
        }
        return
      }
      if (revealed && !typing) {
        const g = GRADES.find((x) => x.key === e.key)
        if (g) submitGrade(g.grade)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, revealed, options, picked, submitGrade])

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
            <div className="font-display text-6xl font-semibold leading-none text-ink-tertiary">
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

  const progress =
    ((currentIndex + (revealed || picked ? 0.5 : 0)) / session.items.length) * 100
  const prompt = mode === 'reverse' ? definition : item.term
  const answer = mode === 'reverse' ? item.term : definition
  const promptIsTerm = mode !== 'reverse'

  return (
    <div className="mx-auto max-w-xl space-y-7">
      {/* Mode switcher */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id)
              resetCard()
            }}
            className={cn(
              'text-[11px] uppercase tracking-[0.16em] font-semibold transition-colors',
              mode === m.id
                ? 'text-accent'
                : 'text-ink-tertiary hover:text-ink'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Progress */}
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

      {/* Card */}
      <div className="leaf relative min-h-[280px] rounded-sm px-6 py-10 sm:px-8">
        <div className="flex flex-col gap-6">
          {/* Prompt */}
          {mode === 'listening' ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Caps>Listen and recall</Caps>
              <SpeakButton
                text={item.term}
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ink text-cream transition-transform hover:scale-105"
              />
              {revealed && (
                <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">
                  {item.term}
                </h2>
              )}
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Caps>
                  {promptIsTerm ? 'Do you remember' : 'Which word means'}
                </Caps>
                <h2
                  className={cn(
                    'font-display font-semibold leading-[1.05] tracking-tight text-ink',
                    promptIsTerm
                      ? 'text-4xl sm:text-5xl'
                      : 'text-[22px] italic sm:text-[26px]'
                  )}
                >
                  {prompt}
                </h2>
              </div>
              {promptIsTerm && (
                <SpeakButton
                  text={item.term}
                  className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink"
                />
              )}
            </div>
          )}

          {/* Typed recall input */}
          {mode === 'typed' && !revealed && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setRevealed(true)
              }}
              className="space-y-4"
            >
              <Input
                autoFocus
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type the definition…"
                className="font-display italic text-[17px]"
              />
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Check answer
              </Button>
            </form>
          )}

          {/* Multiple choice */}
          {mode === 'choice' && (
            <div className="grid gap-2.5">
              {options.map((opt, i) => {
                const isCorrect = opt === definition
                const isPicked = picked === opt
                const show = picked !== null
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pickOption(opt)}
                    disabled={show}
                    className={cn(
                      'flex items-start gap-3 rounded-sm border px-4 py-3 text-left text-[15px] transition-colors',
                      show && isCorrect
                        ? 'border-success bg-success-subtle text-ink'
                        : show && isPicked
                          ? 'border-error bg-error-subtle text-ink'
                          : 'border-rule text-ink hover:border-ink'
                    )}
                  >
                    <span className="font-mono text-[12px] text-ink-tertiary">
                      {i + 1}
                    </span>
                    <span className="font-display italic">{opt}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Reveal for recall modes */}
          {mode !== 'choice' && mode !== 'typed' && !revealed && (
            <>
              <Rule />
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="self-start text-[13px] text-ink underline decoration-accent decoration-[1.5px] underline-offset-[6px] hover:decoration-accent-hover"
              >
                Reveal answer — <span className="italic">space</span>
              </button>
            </>
          )}

          {/* Answer + grades */}
          {revealed && (
            <>
              <Rule />
              <p className="font-display text-[20px] italic leading-snug text-ink">
                {answer}
              </p>
              {mode === 'typed' && typedAnswer.trim() && (
                <p className="text-[13px] text-ink-tertiary">
                  You wrote:{' '}
                  <span className="text-ink-secondary">{typedAnswer.trim()}</span>
                </p>
              )}
              <Rule />
              <div className="grid grid-cols-4 gap-2">
                {GRADES.map((g) => (
                  <Button
                    key={g.grade}
                    onClick={() => submitGrade(g.grade)}
                    disabled={isPending}
                    variant={g.grade === 2 ? 'primary' : g.grade === 3 ? 'accent' : 'outline'}
                    size="sm"
                    className="flex-col gap-0.5 py-2"
                  >
                    {isPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <span>{g.label}</span>
                    )}
                    <span className="font-mono text-[10px] opacity-60">{g.key}</span>
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-center font-display text-[12px] italic text-ink-tertiary">
        {mode === 'choice'
          ? 'Pick the matching definition · keys 1–4'
          : 'Space to reveal · 1 Again · 2 Hard · 3 Good · 4 Easy'}
      </p>
    </div>
  )
}
