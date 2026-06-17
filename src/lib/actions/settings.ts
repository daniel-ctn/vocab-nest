'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { user, userStats } from '@/lib/db/schema'
import { requireUser } from '@/lib/session'

const UpdateSettingsSchema = z.object({
  name: z.string().trim().max(100).optional(),
  dailyGoal: z.number().int().min(1).max(200),
})

export async function updateUserSettings(input: unknown) {
  const current = await requireUser()
  const data = UpdateSettingsSchema.parse(input)

  if (data.name !== undefined) {
    await db
      .update(user)
      .set({ name: data.name, updatedAt: new Date() })
      .where(eq(user.id, current.id))
  }

  await db
    .insert(userStats)
    .values({ userId: current.id, dailyGoal: data.dailyGoal })
    .onConflictDoUpdate({
      target: userStats.userId,
      set: { dailyGoal: data.dailyGoal },
    })

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}
