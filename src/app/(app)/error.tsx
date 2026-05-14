'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Rule } from '@/components/ui/rule'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-xl space-y-8 py-16 text-center">
      <Caps as="div">Something tore</Caps>
      <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink">
        A page came loose.
      </h2>
      <Rule animate />
      <p className="font-display italic text-[17px] text-ink-secondary">
        An unexpected error occurred. Try the page again, or go back to the
        dashboard.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={reset} variant="primary" size="lg">
          <RotateCcw size={14} />
          Try again
        </Button>
        <ButtonLink href="/dashboard" variant="outline" size="lg">
          Dashboard
        </ButtonLink>
      </div>
    </div>
  )
}
