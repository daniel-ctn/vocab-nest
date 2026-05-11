'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Feather, Loader2 } from 'lucide-react'
import { signIn } from '@/lib/auth-client'
import { ThemeToggle } from '@/components/theme-toggle'
import { GoogleSignInButton } from '@/components/google-sign-in'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: '/dashboard',
      })
      if (result.error) {
        setError(result.error.message || 'Failed to sign in')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to sign in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-6 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle className="p-2 rounded-lg text-ink-secondary hover:bg-border-subtle hover:text-ink transition-colors" />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white">
            <Feather size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-semibold text-ink tracking-tight">
            Vocab Nest
          </span>
        </div>

        <h1 className="font-display text-2xl font-semibold text-ink text-center mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-ink-secondary text-center mb-8">
          Sign in to continue your practice
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-ink">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="px-3.5 py-2.5 rounded-lg bg-error-subtle text-error text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-cream text-ink-secondary">or</span>
          </div>
        </div>

        <GoogleSignInButton />

        <p className="mt-6 text-sm text-ink-secondary text-center">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-accent hover:underline"
          >
            Get started
          </Link>
        </p>
      </div>
    </div>
  )
}
