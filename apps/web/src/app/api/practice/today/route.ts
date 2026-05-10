import { TodayPracticeResponseSchema } from "@vocab-nest/contracts";
import { and, eq, isNull, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  practiceSessions,
  practiceItems,
  vocabularyEntries,
} from "@/lib/db/schema";
import { apiSuccess, handleApiError, requireAuth } from "@/lib/route-helpers";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    const today = new Date().toISOString().slice(0, 10);

    let session = await db
      .select()
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.userId, auth.userId),
          eq(practiceSessions.date, today),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (!session) {
      const sessionId = crypto.randomUUID();
      const now = new Date();

      await db.insert(practiceSessions).values({
        id: sessionId,
        userId: auth.userId,
        date: today,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      });

      const dueVocab = await db
        .select({
          id: vocabularyEntries.id,
          term: vocabularyEntries.term,
          definition: vocabularyEntries.definition,
        })
        .from(vocabularyEntries)
        .where(eq(vocabularyEntries.userId, auth.userId));

      if (dueVocab.length > 0) {
        const items = dueVocab.map((v) => ({
          id: crypto.randomUUID(),
          practiceSessionId: sessionId,
          vocabularyId: v.id,
          prompt: v.term,
          dueAt: now,
        }));

        await db.insert(practiceItems).values(items);
      }

      session = (await db
        .select()
        .from(practiceSessions)
        .where(eq(practiceSessions.id, sessionId))
        .limit(1)
        .then((rows) => rows[0]))!;
    }

    const items = await db
      .select({
        id: practiceItems.id,
        vocabularyId: practiceItems.vocabularyId,
        prompt: practiceItems.prompt,
        term: vocabularyEntries.term,
        dueAt: practiceItems.dueAt,
      })
      .from(practiceItems)
      .leftJoin(
        vocabularyEntries,
        eq(practiceItems.vocabularyId, vocabularyEntries.id),
      )
      .where(
        and(
          eq(practiceItems.practiceSessionId, session.id),
          isNull(practiceItems.reviewedAt),
        ),
      );

    const sessionData = {
      id: session.id,
      date: session.date,
      status: session.status as "pending" | "in_progress" | "completed",
      items: items.map((i) => ({
        id: i.id,
        vocabularyId: i.vocabularyId,
        term: i.term ?? i.prompt,
        prompt: i.prompt,
        dueAt: i.dueAt.toISOString(),
      })),
    };

    const payload = TodayPracticeResponseSchema.parse({
      practice: sessionData.items.length > 0 ? sessionData : null,
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
