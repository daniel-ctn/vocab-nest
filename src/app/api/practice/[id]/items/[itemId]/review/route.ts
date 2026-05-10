import {
  PracticeReviewRequestSchema,
  PracticeReviewResponseSchema,
} from "@/lib/contracts";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { practiceItems, practiceSessions } from "@/lib/db/schema";
import {
  ApiException,
  apiSuccess,
  handleApiError,
  parseBody,
  requireAuth,
} from "@/lib/route-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const auth = await requireAuth(request);
    const { id: practiceId, itemId } = await params;
    const input = await parseBody(request, PracticeReviewRequestSchema);

    const session = await db
      .select({ id: practiceSessions.id })
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

    const item = await db
      .select({ id: practiceItems.id })
      .from(practiceItems)
      .where(
        and(
          eq(practiceItems.id, itemId),
          eq(practiceItems.practiceSessionId, practiceId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (!item) {
      throw new ApiException(404, "NOT_FOUND", "Practice item not found.");
    }

    const now = new Date();

    await db
      .update(practiceItems)
      .set({
        reviewedAt: now,
        remembered: input.remembered,
        answer: input.answer ?? null,
      })
      .where(eq(practiceItems.id, itemId));

    await db
      .update(practiceSessions)
      .set({ status: "in_progress", updatedAt: now })
      .where(eq(practiceSessions.id, practiceId));

    const payload = PracticeReviewResponseSchema.parse({
      practiceId,
      itemId,
      reviewed: true,
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
