'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import {
  getStripe,
  getStripePriceId,
  getStripeAnnualPriceId,
} from '@/lib/stripe'
import { requireUser } from '@/lib/session'
import { getSubscription, upsertSubscription } from '@/lib/data/subscription'
import {
  getCurrentPeriodEnd,
  getFirstPriceId,
  getMetadataUserId,
  getStripeReferenceId,
} from '@/lib/stripe-webhook'

export async function createCheckoutSession(
  priceId?: string
): Promise<{ url: string }> {
  const user = await requireUser()
  const sub = await getSubscription(user.id)

  const selectedPriceId =
    priceId || getStripeAnnualPriceId() || getStripePriceId()

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
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
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

export async function syncCheckoutSession(sessionId: string) {
  const user = await requireUser()

  const session = await getStripe().checkout.sessions.retrieve(sessionId)
  const metadataUserId = getMetadataUserId(session)

  if (metadataUserId !== user.id) {
    throw new Error('Checkout session does not belong to the current user')
  }

  const subscriptionId = getStripeReferenceId(session.subscription)
  const customerId = getStripeReferenceId(session.customer)

  if (session.mode !== 'subscription' || !subscriptionId || !customerId) {
    return { status: 'inactive' }
  }

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)

  await upsertSubscription({
    userId: user.id,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: getFirstPriceId(subscription),
    status: subscription.status,
    currentPeriodEnd: getCurrentPeriodEnd(subscription),
  })

  revalidatePath('/settings/billing')

  return { status: subscription.status }
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

  const stripeSub = await getStripe().subscriptions.retrieve(
    sub.stripeSubscriptionId
  )

  await db
    .update(subscriptions)
    .set({
      status: stripeSub.status,
      currentPeriodEnd: getCurrentPeriodEnd(stripeSub),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, user.id))

  revalidatePath('/settings/billing')

  return { status: stripeSub.status }
}
