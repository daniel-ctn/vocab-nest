'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { resetPassword } from '@/lib/auth-client'
import { AuthShell } from '@/components/auth-shell'
import { Button, ButtonLink } from '@/components/ui/button'
import { Field, Input, Label } from '@/components/ui/input'
import { Marginalia } from '@/components/ui/marginalia'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const result = await resetPassword({ newPassword: password })
      if (result.error) {
        setError(result.error.message || 'Failed to reset password')
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell
        eyebrow="Password reset"
        title="The page is clean."
        subtitle="Sign in with your new password."
      >
        <ButtonLink href="/login" variant="primary" size="lg" className="w-full">
          Sign in
        </ButtonLink>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="A fresh start."
      subtitle="Choose a new password for your account."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <Label htmlFor="password" hint="8+ characters">
            New password
          </Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Field>
          <Label htmlFor="confirm">Confirm</Label>
          <Input
            id="confirm"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
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
          Reset password
        </Button>
      </form>

      <p className="text-center text-[13px] text-ink-secondary">
        <Link
          href="/login"
          className="text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px] hover:decoration-accent-hover"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
