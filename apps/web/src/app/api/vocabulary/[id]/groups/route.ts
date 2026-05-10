import {
  VocabularyGroupLinkRequestSchema,
  VocabularyGroupLinkResponseSchema,
} from "@vocab-nest/contracts";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { vocabularyEntries, groups, vocabularyGroups } from "@/lib/db/schema";
import {
  ApiException,
  apiSuccess,
  handleApiError,
  parseBody,
  requireAuth,
} from "@/lib/route-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request);
    const { id: vocabularyId } = await params;
    const input = await parseBody(request, VocabularyGroupLinkRequestSchema);

    const vocabRows = await db
      .select({ id: vocabularyEntries.id })
      .from(vocabularyEntries)
      .where(
        and(
          eq(vocabularyEntries.id, vocabularyId),
          eq(vocabularyEntries.userId, auth.userId),
        ),
      )
      .limit(1);

    if (vocabRows.length === 0) {
      throw new ApiException(404, "NOT_FOUND", "Vocabulary entry not found.");
    }

    const groupRows = await db
      .select({ id: groups.id })
      .from(groups)
      .where(
        and(eq(groups.id, input.groupId), eq(groups.userId, auth.userId)),
      )
      .limit(1);

    if (groupRows.length === 0) {
      throw new ApiException(404, "NOT_FOUND", "Group not found.");
    }

    await db
      .insert(vocabularyGroups)
      .values({ vocabularyId, groupId: input.groupId })
      .onConflictDoNothing();

    const payload = VocabularyGroupLinkResponseSchema.parse({
      vocabularyId,
      groupId: input.groupId,
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
