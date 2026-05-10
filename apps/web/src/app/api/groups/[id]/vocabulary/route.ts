import { GroupVocabularyResponseSchema } from "@vocab-nest/contracts";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, vocabularyEntries, vocabularyGroups } from "@/lib/db/schema";
import {
  ApiException,
  apiSuccess,
  handleApiError,
  requireAuth,
} from "@/lib/route-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;

    const groupRows = await db
      .select()
      .from(groups)
      .where(and(eq(groups.id, id), eq(groups.userId, auth.userId)))
      .limit(1);

    const group = groupRows[0];
    if (!group) {
      throw new ApiException(404, "NOT_FOUND", "Group not found.");
    }

    const vocabRows = await db
      .select({
        id: vocabularyEntries.id,
        term: vocabularyEntries.term,
        definition: vocabularyEntries.definition,
        language: vocabularyEntries.language,
        partOfSpeech: vocabularyEntries.partOfSpeech,
        examples: vocabularyEntries.examples,
        tags: vocabularyEntries.tags,
        createdAt: vocabularyEntries.createdAt,
        updatedAt: vocabularyEntries.updatedAt,
      })
      .from(vocabularyEntries)
      .innerJoin(
        vocabularyGroups,
        eq(vocabularyEntries.id, vocabularyGroups.vocabularyId),
      )
      .where(eq(vocabularyGroups.groupId, id));

    const items = vocabRows.map((v) => ({
      id: v.id,
      term: v.term,
      definition: v.definition,
      language: v.language,
      partOfSpeech: v.partOfSpeech,
      examples: v.examples as string[],
      tags: v.tags as string[],
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));

    const payload = GroupVocabularyResponseSchema.parse({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        vocabularyCount: items.length,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
      },
      items,
      total: items.length,
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
