import {
  DeleteResponseSchema,
  UpdateVocabularyRequestSchema,
  VocabularyDetailResponseSchema,
} from "@vocab-nest/contracts";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { vocabularyEntries } from "@/lib/db/schema";
import {
  ApiException,
  apiSuccess,
  handleApiError,
  parseBody,
  requireAuth,
} from "@/lib/route-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;

    const rows = await db
      .select()
      .from(vocabularyEntries)
      .where(
        and(eq(vocabularyEntries.id, id), eq(vocabularyEntries.userId, auth.userId)),
      )
      .limit(1);

    const entry = rows[0];
    if (!entry) {
      throw new ApiException(404, "NOT_FOUND", "Vocabulary entry not found.");
    }

    const payload = VocabularyDetailResponseSchema.parse({
      item: {
        id: entry.id,
        term: entry.term,
        definition: entry.definition,
        language: entry.language,
        partOfSpeech: entry.partOfSpeech,
        examples: entry.examples as string[],
        tags: entry.tags as string[],
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      },
    });

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
    const input = await parseBody(request, UpdateVocabularyRequestSchema);

    const existing = await db
      .select({ id: vocabularyEntries.id })
      .from(vocabularyEntries)
      .where(
        and(eq(vocabularyEntries.id, id), eq(vocabularyEntries.userId, auth.userId)),
      )
      .limit(1);

    if (existing.length === 0) {
      throw new ApiException(404, "NOT_FOUND", "Vocabulary entry not found.");
    }

    const now = new Date();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { updatedAt: now };
    if (input.term !== undefined) updateData.term = input.term;
    if (input.definition !== undefined) updateData.definition = input.definition;
    if (input.language !== undefined) updateData.language = input.language;
    if (input.partOfSpeech !== undefined) updateData.partOfSpeech = input.partOfSpeech;
    if (input.examples !== undefined) updateData.examples = input.examples;
    if (input.tags !== undefined) updateData.tags = input.tags;

    await db.update(vocabularyEntries).set(updateData).where(eq(vocabularyEntries.id, id));

    const rows = await db
      .select()
      .from(vocabularyEntries)
      .where(eq(vocabularyEntries.id, id))
      .limit(1);

    const entry = rows[0];
    const payload = VocabularyDetailResponseSchema.parse({
      item: {
        id: entry.id,
        term: entry.term,
        definition: entry.definition,
        language: entry.language,
        partOfSpeech: entry.partOfSpeech,
        examples: entry.examples as string[],
        tags: entry.tags as string[],
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      },
    });

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
      .select({ id: vocabularyEntries.id })
      .from(vocabularyEntries)
      .where(
        and(eq(vocabularyEntries.id, id), eq(vocabularyEntries.userId, auth.userId)),
      )
      .limit(1);

    if (existing.length === 0) {
      throw new ApiException(404, "NOT_FOUND", "Vocabulary entry not found.");
    }

    await db.delete(vocabularyEntries).where(eq(vocabularyEntries.id, id));

    const payload = DeleteResponseSchema.parse({ id, deleted: true });
    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
