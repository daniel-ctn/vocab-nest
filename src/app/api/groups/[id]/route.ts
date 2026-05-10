import {
  DeleteResponseSchema,
  GroupDetailResponseSchema,
  UpdateGroupRequestSchema,
} from "@/lib/contracts";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, vocabularyGroups } from "@/lib/db/schema";
import {
  ApiException,
  apiSuccess,
  handleApiError,
  parseBody,
  requireAuth,
} from "@/lib/route-helpers";

async function getGroupWithCount(id: string, userId: string) {
  const rows = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      createdAt: groups.createdAt,
      updatedAt: groups.updatedAt,
      vocabularyCount: sql<number>`COALESCE((
        SELECT COUNT(*)::int
        FROM ${vocabularyGroups}
        WHERE ${vocabularyGroups.groupId} = ${groups.id}
      ), 0)`,
    })
    .from(groups)
    .where(and(eq(groups.id, id), eq(groups.userId, userId)))
    .limit(1);

  const group = rows[0];
  if (!group) {
    throw new ApiException(404, "NOT_FOUND", "Group not found.");
  }

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    vocabularyCount: group.vocabularyCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const group = await getGroupWithCount(id, auth.userId);

    const payload = GroupDetailResponseSchema.parse({ group });
    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const input = await parseBody(request, UpdateGroupRequestSchema);

    const existing = await db
      .select({ id: groups.id })
      .from(groups)
      .where(and(eq(groups.id, id), eq(groups.userId, auth.userId)))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiException(404, "NOT_FOUND", "Group not found.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;

    await db.update(groups).set(updateData).where(eq(groups.id, id));

    const group = await getGroupWithCount(id, auth.userId);
    const payload = GroupDetailResponseSchema.parse({ group });
    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;

    const existing = await db
      .select({ id: groups.id })
      .from(groups)
      .where(and(eq(groups.id, id), eq(groups.userId, auth.userId)))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiException(404, "NOT_FOUND", "Group not found.");
    }

    await db.delete(groups).where(eq(groups.id, id));

    const payload = DeleteResponseSchema.parse({ id, deleted: true });
    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
