'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { groups } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import {
  CreateGroupRequestSchema,
  UpdateGroupRequestSchema,
} from '@/lib/contracts'

export async function createGroup(input: unknown) {
  const user = await getCurrentUser()
  const data = CreateGroupRequestSchema.parse(input)

  const id = crypto.randomUUID()
  const now = new Date()

  await db.insert(groups).values({
    id,
    userId: user.id,
    name: data.name,
    description: data.description ?? null,
    createdAt: now,
    updatedAt: now,
  })

  revalidatePath('/groups')
  revalidatePath('/dashboard')
  return { id }
}

export async function updateGroup(id: string, input: unknown) {
  const user = await getCurrentUser()
  const data = UpdateGroupRequestSchema.parse(input)

  const owned = await db
    .select({ id: groups.id })
    .from(groups)
    .where(and(eq(groups.id, id), eq(groups.userId, user.id)))
    .limit(1)

  if (owned.length === 0) {
    throw new Error('Group not found.')
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description

  await db.update(groups).set(updateData).where(eq(groups.id, id))

  revalidatePath('/groups')
  revalidatePath(`/groups/${id}`)
}

export async function deleteGroup(id: string) {
  const user = await getCurrentUser()

  const owned = await db
    .select({ id: groups.id })
    .from(groups)
    .where(and(eq(groups.id, id), eq(groups.userId, user.id)))
    .limit(1)

  if (owned.length === 0) {
    throw new Error('Group not found.')
  }

  await db.delete(groups).where(eq(groups.id, id))

  revalidatePath('/groups')
  revalidatePath('/dashboard')
}
