import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { subscriptions, user } from '@/lib/db/schema'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export async function POST(req: Request) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  const stripe = getStripe()

  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        if (session.mode === 'subscription' && session.customer) {
          const customerId =
            typeof session.customer === 'string'
              ? session.customer
              : session.customer.id

          const userRow = await db
            .select()
            .from(user)
            .where(eq(user.email, session.customer_email ?? ''))
            .limit(1)
            .then((rows) => rows[0])

          if (!userRow) {
            return NextResponse.json(
              { error: 'User not found' },
              { status: 404 }
            )
          }

          const subscription = await getStripe().subscriptions.retrieve(
            session.subscription as string
          )
          const subData = subscription as any

          await db
            .insert(subscriptions)
            .values({
              userId: userRow.id,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subData.id,
              stripePriceId: subData.items.data[0]?.price.id ?? null,
              status: subData.status,
              currentPeriodEnd: new Date(subData.current_period_end * 1000),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: subscriptions.userId,
              set: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subData.id,
                stripePriceId: subData.items.data[0]?.price.id ?? null,
                status: subData.status,
                currentPeriodEnd: new Date(subData.current_period_end * 1000),
                updatedAt: new Date(),
              },
            })
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        const subRow = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1)
          .then((rows) => rows[0])

        if (subRow) {
          await db
            .update(subscriptions)
            .set({
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id ?? null,
              status: subscription.status,
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, subRow.userId))
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        const subRow = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1)
          .then((rows) => rows[0])

        if (subRow) {
          await db
            .update(subscriptions)
            .set({
              status: 'canceled',
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, subRow.userId))
        }
        break
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Webhook handler failed: ${message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
