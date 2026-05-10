import { PracticeCompleteResponseSchema } from "@/lib/contracts";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  practiceItems,
  practiceSessions,
  userStats,
} from "@/lib/db/schema";
import {
  ApiException,
  apiSuccess,
  handleApiError,
  requireAuth,
} from "@/lib/route-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request);
    const { id: practiceId } = await params;

    const session = await db
      .select()
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.id, practiceId),
          eq(practiceSessions.userId, auth.userId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (!session) {
      throw new ApiException(404, "NOT_FOUND", "Practice session not found.");
    }

    if (session.status === "completed") {
      throw new ApiException(400, "ALREADY_COMPLETED", "Practice session is already completed.");
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    await db
      .update(practiceSessions)
      .set({ status: "completed", updatedAt: now })
      .where(eq(practiceSessions.id, practiceId));

    const reviewedCount = await db
      .select()
      .from(practiceItems)
      .where(
        and(
          eq(practiceItems.practiceSessionId, practiceId),
        ),
      )
      .then((rows) => rows.filter((r) => r.reviewedAt !== null).length);

    if (reviewedCount > 0) {
      const stats = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, auth.userId))
        .limit(1)
        .then((rows) => rows[0]);

      if (stats) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        let streak = stats.streakDays;
        if (stats.lastPracticeDate === yesterdayStr) {
          streak += 1;
        } else if (stats.lastPracticeDate !== today) {
          streak = 1;
        }

        await db
          .update(userStats)
          .set({ streakDays: streak, lastPracticeDate: today })
          .where(eq(userStats.userId, auth.userId));
      }
    }

    const payload = PracticeCompleteResponseSchema.parse({
      practiceId,
      completed: true,
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
