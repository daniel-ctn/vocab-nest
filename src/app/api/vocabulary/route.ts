import {
  CreateVocabularyRequestSchema,
  VocabularyDetailResponseSchema,
  VocabularyListResponseSchema,
} from "@/lib/contracts";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { vocabularyEntries } from "@/lib/db/schema";
import {
  apiSuccess,
  handleApiError,
  parseBody,
  requireAuth,
} from "@/lib/route-helpers";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    const input = await parseBody(request, CreateVocabularyRequestSchema);

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(vocabularyEntries).values({
      id,
      userId: auth.userId,
      term: input.term,
      definition: input.definition,
      language: input.language ?? null,
      partOfSpeech: input.partOfSpeech ?? null,
      examples: input.examples ?? [],
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });

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

    return apiSuccess(payload, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);

    const rows = await db
      .select()
      .from(vocabularyEntries)
      .where(eq(vocabularyEntries.userId, auth.userId))
      .orderBy(vocabularyEntries.updatedAt);

    const items = rows.map((entry) => ({
      id: entry.id,
      term: entry.term,
      definition: entry.definition,
      language: entry.language,
      partOfSpeech: entry.partOfSpeech,
      examples: entry.examples as string[],
      tags: entry.tags as string[],
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));

    const payload = VocabularyListResponseSchema.parse({
      items,
      total: items.length,
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
