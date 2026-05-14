import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { isPro } from '@/lib/data/subscription'
import { createCheckoutSession } from '@/lib/actions/billing'
import { getStripePriceId, getStripeAnnualPriceId } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'

const FEATURES = [
  'Unlimited vocabulary words',
  'Unlimited groups',
  'Practice by group',
  'Advanced stats & insights',
  'Bulk import vocabulary',
  'Export your data',
  'Custom daily goals',
]

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

  if (!monthlyPriceId) {
    return (
      <div className="space-y-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary hover:text-ink"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>
        <Chapter
          eyebrow="Pro plan"
          title="Coming soon."
          subtitle="Pro features are being typeset. Check back later."
        />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <Chapter
        eyebrow="Pro plan"
        title="A thicker volume."
        subtitle="Unlock the full workshop and keep your collection growing."
      />

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        {/* Monthly */}
        <form action={handleCheckoutMonthly} className="space-y-6">
          <Caps as="div">Monthly</Caps>
          <Rule />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[68px] font-semibold leading-none tabular-nums text-ink">
              $5
            </span>
            <Marginalia>per month</Marginalia>
          </div>
          <ul className="space-y-2.5">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="grid grid-cols-[16px_1fr] items-baseline gap-2 text-[14px] text-ink"
              >
                <Check size={14} className="text-ink-tertiary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button type="submit" variant="outline" size="lg" className="w-full">
            Subscribe monthly
          </Button>
        </form>

        {/* Annual */}
        <form action={handleCheckoutAnnual} className="space-y-6">
          <div className="flex items-baseline justify-between">
            <Caps as="div">Annual</Caps>
            <span className="font-display text-[12px] italic text-accent">
              recommended
            </span>
          </div>
          <Rule />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[68px] font-semibold leading-none tabular-nums text-ink">
              $40
            </span>
            <Marginalia>per year · save 33%</Marginalia>
          </div>
          <ul className="space-y-2.5">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="grid grid-cols-[16px_1fr] items-baseline gap-2 text-[14px] text-ink"
              >
                <Check size={14} className="text-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Subscribe yearly
          </Button>
        </form>
      </div>

      <Marginalia className="text-center">
        Cancel anytime. Payments processed securely by Stripe.
      </Marginalia>
    </div>
  )
}
