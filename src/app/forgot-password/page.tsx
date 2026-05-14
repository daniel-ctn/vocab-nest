'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { requestPasswordReset } from '@/lib/auth-client'
import { AuthShell } from '@/components/auth-shell'
import { ButtonLink, Button } from '@/components/ui/button'
import { Field, Input, Label } from '@/components/ui/input'
import { Marginalia } from '@/components/ui/marginalia'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await requestPasswordReset({
        email,
        redirectTo: '/reset-password',
      })
      if (result.error) {
        setError(result.error.message || 'Failed to send reset link')
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to send reset link')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell
        eyebrow="Check your email"
        title="A link is on the way."
        subtitle={
          <>
            If an account exists for <span className="not-italic text-ink">{email}</span>,
            we&apos;ve sent a password reset link.
          </>
        }
      >
        <ButtonLink href="/login" variant="outline" size="lg" className="w-full">
          Back to sign in
        </ButtonLink>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Forgot it?"
      subtitle="Enter your email and we&apos;ll send a link to set a new one."
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

        {error && <Marginalia className="text-error">{error}</Marginalia>}

        <Button
          type="submit"
          disabled={submitting}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Send reset link
        </Button>
      </form>

      <p className="text-center text-[13px] text-ink-secondary">
        Remembered it?{' '}
        <Link
          href="/login"
          className="text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px] hover:decoration-accent-hover"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
