import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Check, ArrowLeft, Zap } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { isPro } from '@/lib/data/subscription'
import { createCheckoutSession } from '@/lib/actions/billing'
import { getStripePriceId, getStripeAnnualPriceId } from '@/lib/stripe'

export default async function UpgradePage() {
  const user = await requireUser()
  const pro = await isPro(user.id)

  if (pro) {
    redirect('/settings/billing')
  }

  let monthlyPriceId: string | null = null
  let annualPriceId: string | null = null
  try {
    monthlyPriceId = getStripePriceId()
    annualPriceId = getStripeAnnualPriceId() ?? null
  } catch {
    monthlyPriceId = null
    annualPriceId = null
  }

  async function handleCheckoutMonthly() {
    'use server'
    if (!monthlyPriceId) {
      throw new Error('Stripe is not configured. Please contact support.')
    }
    const { url } = await createCheckoutSession(monthlyPriceId)
    redirect(url)
  }

  async function handleCheckoutAnnual() {
    'use server'
    const priceId = annualPriceId || monthlyPriceId
    if (!priceId) {
      throw new Error('Stripe is not configured. Please contact support.')
    }
    const { url } = await createCheckoutSession(priceId)
    redirect(url)
  }

  const features = [
    'Unlimited vocabulary words',
    'Unlimited groups',
    'Practice by group',
    'Advanced stats & insights',
    'Bulk import vocabulary',
    'Export your data',
    'Custom daily goals',
  ]

  if (!monthlyPriceId) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-subtle mb-2">
            <Zap size={24} className="text-accent" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Upgrade to Pro
          </h1>
          <p className="text-ink-secondary max-w-md mx-auto">
            Pro features are coming soon. Check back later!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-subtle mb-2">
          <Zap size={24} className="text-accent" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Upgrade to Pro
        </h1>
        <p className="text-ink-secondary max-w-md mx-auto">
          Unlock the full power of Vocab Nest and accelerate your learning.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form
          action={handleCheckoutMonthly}
          className="p-6 rounded-2xl bg-surface border border-border space-y-4"
        >
          <div className="text-sm font-medium text-ink-secondary uppercase tracking-wide">
            Monthly
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-semibold text-ink">
              $5
            </span>
            <span className="text-ink-secondary">/month</span>
          </div>
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink">
                <Check size={14} className="text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Subscribe monthly
          </button>
        </form>

        <form
          action={handleCheckoutAnnual}
          className="p-6 rounded-2xl bg-surface border-2 border-accent space-y-4 relative"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-white text-xs font-medium">
            Best value
          </div>
          <div className="text-sm font-medium text-ink-secondary uppercase tracking-wide">
            Annual
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-semibold text-ink">
              $40
            </span>
            <span className="text-ink-secondary">/year</span>
          </div>
          <p className="text-xs text-success font-medium">
            Save 33% vs monthly
          </p>
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink">
                <Check size={14} className="text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Subscribe yearly
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-ink-tertiary">
        Cancel anytime. Payments processed securely by Stripe.
      </p>
    </div>
  )
}
