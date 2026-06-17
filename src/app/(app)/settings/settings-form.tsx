'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { updateUserSettings } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Field, Input, Label } from '@/components/ui/input'
import { Marginalia } from '@/components/ui/marginalia'

export function SettingsForm({
  name,
  dailyGoal,
}: {
  name: string
  dailyGoal: number
}) {
  const router = useRouter()
  const [nameValue, setNameValue] = useState(name)
  const [goalValue, setGoalValue] = useState(String(dailyGoal))
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
        await updateUserSettings({ name: nameValue.trim(), dailyGoal: goal })
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
