import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'

export async function getSubscription(userId: string) {
  try {
    const row = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)
      .then((rows) => rows[0] ?? null)

    return row
  } catch {
    // Table may not exist yet (db:push not run)
    return null
  }
}

export async function isPro(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId)
  if (!sub) return false
  return sub.status === 'active' || sub.status === 'trialing'
}

export async function upsertSubscription(data: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId?: string | null
  stripePriceId?: string | null
  status: string
  currentPeriodEnd?: Date | null
}) {
  const now = new Date()

  await db
    .insert(subscriptions)
    .values({
      userId: data.userId,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId ?? null,
      stripePriceId: data.stripePriceId ?? null,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId ?? null,
        stripePriceId: data.stripePriceId ?? null,
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        updatedAt: now,
      },
    })
}
