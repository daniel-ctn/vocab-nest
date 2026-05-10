import {
  CreateGroupRequestSchema,
  GroupDetailResponseSchema,
  GroupListResponseSchema,
} from "@vocab-nest/contracts";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, vocabularyGroups } from "@/lib/db/schema";
import {
  apiSuccess,
  handleApiError,
  parseBody,
  requireAuth,
} from "@/lib/route-helpers";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    const input = await parseBody(request, CreateGroupRequestSchema);

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(groups).values({
      id,
      userId: auth.userId,
      name: input.name,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const rows = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1);

    const group = rows[0];
    const payload = GroupDetailResponseSchema.parse({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        vocabularyCount: 0,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
      },
    });

    return apiSuccess(payload, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);

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
      .where(eq(groups.userId, auth.userId))
      .orderBy(groups.updatedAt);

    const items = rows.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      vocabularyCount: g.vocabularyCount,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    }));

    const payload = GroupListResponseSchema.parse({
      items,
      total: items.length,
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
