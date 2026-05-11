'use server'

import { revalidatePath } from 'next/cache'
import { getStripe, getStripePriceId, getStripeAnnualPriceId } from '@/lib/stripe'
import { requireUser } from '@/lib/session'
import { getSubscription } from '@/lib/data/subscription'

export async function createCheckoutSession(
  priceId?: string
): Promise<{ url: string }> {
  const user = await requireUser()
  const sub = await getSubscription(user.id)

  const selectedPriceId = priceId || getStripeAnnualPriceId() || getStripePriceId()

  const session = await getStripe().checkout.sessions.create({
    customer: sub?.stripeCustomerId ?? undefined,
    customer_email: sub?.stripeCustomerId ? undefined : user.email,
    line_items: [
      {
        price: selectedPriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=1`,
    metadata: {
      userId: user.id,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
      },
    },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  return { url: session.url }
}

export async function createPortalSession(): Promise<{ url: string }> {
  const user = await requireUser()
  const sub = await getSubscription(user.id)

  if (!sub?.stripeCustomerId) {
    throw new Error('No subscription found')
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  if (!session.url) {
    throw new Error('Failed to create portal session')
  }

  return { url: session.url }
}

export async function syncSubscription() {
  const user = await requireUser()
  const sub = await getSubscription(user.id)

  if (!sub?.stripeSubscriptionId) {
    return { status: sub?.status ?? 'inactive' }
  }

  const stripeSubResponse = await getStripe().subscriptions.retrieve(
    sub.stripeSubscriptionId
  )
  const stripeSub = stripeSubResponse as any

  const { eq } = await import('drizzle-orm')
  const { db } = await import('@/lib/db')
  const { subscriptions } = await import('@/lib/db/schema')

  await db
    .update(subscriptions)
    .set({
      status: stripeSub.status,
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, user.id))

  revalidatePath('/settings/billing')

  return { status: stripeSub.status }
}
