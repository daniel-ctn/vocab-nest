import { ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Rule } from '@/components/ui/rule'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-6 text-center">
      <Caps as="div">Lost leaf</Caps>
      <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink">
        This page isn&apos;t bound.
      </h1>
      <Rule animate />
      <p className="font-display italic text-[17px] text-ink-secondary">
        The page you&apos;re looking for was never bound into this volume — it
        may have been moved or removed.
      </p>
      <div className="flex items-center justify-center gap-3">
        <ButtonLink href="/dashboard" variant="primary" size="lg">
          Your nest
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="lg">
          Home
        </ButtonLink>
      </div>
    </div>
  )
}
