import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getSubscription } from '@/lib/data/subscription'
import {
  createPortalSession,
  syncCheckoutSession,
  syncSubscription,
} from '@/lib/actions/billing'
import { Button, ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; session_id?: string }>
}) {
  const { success, session_id: sessionId } = await searchParams
  const user = await requireUser()

  if (success && sessionId) {
    try {
      await syncCheckoutSession(sessionId)
    } catch {
      // Keep rendering billing state from the database if Stripe sync is delayed.
    }
  }

  let sub: Awaited<ReturnType<typeof getSubscription>> = null
  try {
    sub = await getSubscription(user.id)
  } catch {
    sub = null
  }

  const isPro = sub?.status === 'active' || sub?.status === 'trialing'
  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  async function handleManage() {
    'use server'
    const { url } = await createPortalSession()
    redirect(url)
  }

  async function handleSync() {
    'use server'
    await syncSubscription()
  }

  return (
    <div className="space-y-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <Chapter
        eyebrow="Account"
        title="Billing"
        subtitle="Manage your subscription and plan."
      />

      {success && (
        <Marginalia
          className={isPro ? 'text-success' : 'text-accent'}
        >
          {isPro
            ? 'Welcome to Pro. Your subscription is active.'
            : 'Payment completed. Your plan will update once Stripe confirms.'}
        </Marginalia>
      )}

      <section className="space-y-5">
        <Caps as="div">Current plan</Caps>
        <Rule />
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="font-display text-4xl font-semibold leading-tight text-ink">
              {isPro ? 'Pro' : 'Free'}
            </div>
            <Marginalia>
              {isPro
                ? periodEnd
                  ? `Renews on ${periodEnd}`
                  : 'Active subscription'
                : 'Limited to 100 words and 3 groups'}
            </Marginalia>
          </div>
          {!isPro && (
            <ButtonLink href="/upgrade" variant="primary" size="lg">
              Upgrade to Pro
            </ButtonLink>
          )}
        </div>

        {isPro ? (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <form action={handleManage}>
              <Button type="submit" variant="primary">
                <CreditCard size={13} />
                Manage subscription
              </Button>
            </form>
            <form action={handleSync}>
              <Button type="submit" variant="ghost">
                Sync status
              </Button>
            </form>
          </div>
        ) : (
          <Marginalia>
            Free accounts are limited to 100 vocabulary words and 3 groups.
            Bulk import, stats, and practice-by-group are Pro-only.
          </Marginalia>
        )}
      </section>

      {isPro && sub && (
        <section className="space-y-4">
          <Caps as="div">Details</Caps>
          <Rule />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
            <div>
              <Caps as="div" className="mb-1 text-ink-tertiary">
                Status
              </Caps>
              <dd className="font-display text-[18px] font-semibold capitalize text-ink">
                {sub.status}
              </dd>
            </div>
            <div>
              <Caps as="div" className="mb-1 text-ink-tertiary">
                Current period ends
              </Caps>
              <dd className="font-display text-[18px] font-semibold text-ink">
                {periodEnd ?? '—'}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  )
}
