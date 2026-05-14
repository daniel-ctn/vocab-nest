'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { signUp } from '@/lib/auth-client'
import { AuthShell } from '@/components/auth-shell'
import { GoogleSignInButton } from '@/components/google-sign-in'
import { Button } from '@/components/ui/button'
import { Field, Input, Label } from '@/components/ui/input'
import { Marginalia } from '@/components/ui/marginalia'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await signUp.email({
        name,
        email,
        password,
        callbackURL: '/dashboard',
      })
      if (result.error) {
        setError(result.error.message || 'Failed to create account')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Start your nest"
      title="Begin a vocabulary."
      subtitle="A small page today; a thicker book by year's end."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </Field>
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
          <Label htmlFor="password" hint="8+ characters">
            Password
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
          Create account
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
        Already have a book?{' '}
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
