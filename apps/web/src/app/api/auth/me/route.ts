import { MeResponseSchema } from "@vocab-nest/contracts";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  ApiException,
  apiSuccess,
  handleApiError,
  requireAuth,
} from "@/lib/route-helpers";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);

    const user = rows[0];
    if (!user) {
      throw new ApiException(404, "USER_NOT_FOUND", "User not found.");
    }

    const payload = MeResponseSchema.parse({
      user: { id: user.id, email: user.email, name: user.name },
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
