import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CreditCard, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getSubscription } from '@/lib/data/subscription'
import { createPortalSession, syncSubscription } from '@/lib/actions/billing'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { success } = await searchParams
  const user = await requireUser()

  let sub: Awaited<ReturnType<typeof getSubscription>> = null
  try {
    sub = await getSubscription(user.id)
  } catch {
    sub = null
  }

  const isPro = sub?.status === 'active' || sub?.status === 'trialing'
  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString()
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
    <div className="max-w-xl mx-auto space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Billing
        </h1>
        <p className="text-ink-secondary mt-1">
          Manage your subscription and plan.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-success-subtle text-success text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          Welcome to Pro! Your subscription is now active.
        </div>
      )}

      <div className="p-6 rounded-2xl bg-surface border border-border space-y-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg ${
              isPro ? 'bg-accent text-white' : 'bg-border-subtle text-ink-secondary'
            }`}
          >
            <Zap size={18} />
          </div>
          <div>
            <div className="font-display text-lg font-semibold text-ink">
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </div>
            <div className="text-sm text-ink-secondary">
              {isPro
                ? periodEnd
                  ? `Renews on ${periodEnd}`
                  : 'Active subscription'
                : 'Limited to 100 words and 3 groups'}
            </div>
          </div>
        </div>

        {isPro ? (
          <div className="space-y-3">
            <form action={handleManage}>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <CreditCard size={16} />
                Manage subscription
              </button>
            </form>
            <form action={handleSync}>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-ink-secondary hover:bg-border-subtle transition-colors"
              >
                Sync status
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              href="/upgrade"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              <Zap size={16} />
              Upgrade to Pro
            </Link>
            <div className="flex items-start gap-2 text-xs text-ink-secondary">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>
                Free accounts are limited to 100 vocabulary words and 3 groups.
                Some features like bulk import, stats, and practice by group are
                Pro-only.
              </span>
            </div>
          </div>
        )}
      </div>

      {isPro && sub && (
        <div className="p-5 rounded-xl bg-cream border border-border space-y-3">
          <h2 className="font-display text-base font-semibold text-ink">
            Subscription details
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-ink-secondary">Status</div>
              <div className="text-ink font-medium capitalize">
                {sub.status}
              </div>
            </div>
            <div>
              <div className="text-ink-secondary">Current period ends</div>
              <div className="text-ink font-medium">
                {periodEnd ?? '—'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
