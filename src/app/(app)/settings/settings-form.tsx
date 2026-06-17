'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { updateUserSettings } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Field, Input, Label } from '@/components/ui/input'
import { Marginalia } from '@/components/ui/marginalia'
import { cn } from '@/lib/cn'

export function SettingsForm({
  name,
  dailyGoal,
  emailReminders,
}: {
  name: string
  dailyGoal: number
  emailReminders: boolean
}) {
  const router = useRouter()
  const [nameValue, setNameValue] = useState(name)
  const [goalValue, setGoalValue] = useState(String(dailyGoal))
  const [reminders, setReminders] = useState(emailReminders)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const goal = Number(goalValue)
    if (!Number.isFinite(goal) || goal < 1 || goal > 200) {
      setError('Daily goal must be between 1 and 200.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await updateUserSettings({
          name: nameValue.trim(),
          dailyGoal: goal,
          emailReminders: reminders,
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      } catch {
        setError('Failed to save settings.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Field>
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          placeholder="Your name"
          maxLength={100}
        />
      </Field>

      <Field>
        <Label htmlFor="goal" hint="words reviewed per day">
          Daily goal
        </Label>
        <Input
          id="goal"
          type="number"
          min={1}
          max={200}
          value={goalValue}
          onChange={(e) => setGoalValue(e.target.value)}
          className="font-display text-[20px] font-semibold tabular-nums"
        />
      </Field>

      <div className="space-y-3">
        <button
          type="button"
          role="switch"
          aria-checked={reminders}
          onClick={() => setReminders((v) => !v)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <span>
            <span className="block font-mono text-[10.5px] uppercase tracking-[0.18em] font-medium text-ink-secondary">
              Daily reminder email
            </span>
            <span className="font-display text-[13px] italic text-ink-tertiary">
              A nudge when words are due and your streak is at risk.
            </span>
          </span>
          <span
            className={cn(
              'relative h-5 w-9 shrink-0 rounded-full transition-colors',
              reminders ? 'bg-accent' : 'bg-rule'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-surface transition-all',
                reminders ? 'left-[18px]' : 'left-0.5'
              )}
            />
          </span>
        </button>
      </div>

      {error && <Marginalia className="text-error">{error}</Marginalia>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending} variant="primary">
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saved ? (
            <Check size={14} />
          ) : null}
          {saved ? 'Saved' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
