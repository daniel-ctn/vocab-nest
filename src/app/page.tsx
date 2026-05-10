'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Feather, ArrowRight } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace('/dashboard')
    }
  }, [isPending, session, router])

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-cream">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 h-16">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white">
            <Feather size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold text-ink tracking-tight">
            Vocab Nest
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle className="p-2 rounded-lg text-ink-secondary hover:bg-border-subtle hover:text-ink transition-colors" />
          <Link
            href="/login"
            className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Get started
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-ink leading-[1.15] max-w-3xl">
          Build your vocabulary,
          <br />
          <span className="text-accent">one word at a time.</span>
        </h1>
        <p className="mt-6 text-lg text-ink-secondary max-w-xl leading-relaxed">
          A calm, focused space to collect words, organize them into groups, and
          practice daily to build a lasting habit.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-base font-medium hover:bg-accent-hover transition-colors shadow-sm"
          >
            Start learning
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-surface border border-border text-ink text-base font-medium hover:bg-border-subtle transition-colors"
          >
            Sign in
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-ink-tertiary">
        &copy; {new Date().getFullYear()} Vocab Nest
      </footer>
    </div>
  )
}
