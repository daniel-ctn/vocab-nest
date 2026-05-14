'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { signIn } from '@/lib/auth-client'
import { AuthShell } from '@/components/auth-shell'
import { GoogleSignInButton } from '@/components/google-sign-in'
import { Button } from '@/components/ui/button'
import { Field, Input, Label } from '@/components/ui/input'
import { Marginalia } from '@/components/ui/marginalia'

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
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back."
      subtitle="Pick up where you left the page."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field>
          <Label
            htmlFor="password"
            hint={
              <Link
                href="/forgot-password"
                className="text-accent underline decoration-accent decoration-[1.5px] underline-offset-[5px]"
              >
                forgot?
              </Link>
            }
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        {error && (
          <Marginalia className="text-error">{error}</Marginalia>
        )}

        <Button
          type="submit"
          disabled={submitting}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-rule" />
        <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-tertiary">
          or
        </span>
        <div className="h-px flex-1 bg-rule" />
      </div>

      <GoogleSignInButton />

      <p className="text-center text-[13px] text-ink-secondary">
        New here?{' '}
        <Link
          href="/register"
          className="text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px] hover:decoration-accent-hover"
        >
          Get started
        </Link>
      </p>
    </AuthShell>
  )
}
