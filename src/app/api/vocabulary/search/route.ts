import {
  VocabularySearchRequestSchema,
  VocabularySearchResponseSchema,
} from "@/lib/contracts";
import { and, eq, ilike } from "drizzle-orm";
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
    const input = await parseBody(request, VocabularySearchRequestSchema);

    const conditions = [
      eq(vocabularyEntries.userId, auth.userId),
      ilike(vocabularyEntries.term, `%${input.query}%`),
    ];

    if (input.language) {
      conditions.push(eq(vocabularyEntries.language, input.language));
    }

    const rows = await db
      .select({
        term: vocabularyEntries.term,
        definition: vocabularyEntries.definition,
        language: vocabularyEntries.language,
        partOfSpeech: vocabularyEntries.partOfSpeech,
        examples: vocabularyEntries.examples,
      })
      .from(vocabularyEntries)
      .where(and(...conditions))
      .limit(50);

    const payload = VocabularySearchResponseSchema.parse({
      items: rows.map((r) => ({
        ...r,
        examples: (r.examples as string[]) ?? [],
      })),
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
