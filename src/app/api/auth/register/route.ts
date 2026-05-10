import {
  RegisterRequestSchema,
  AuthResponseSchema,
} from "@/lib/contracts";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, userStats } from "@/lib/db/schema";
import { signJwt } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import {
  ApiException,
  apiSuccess,
  handleApiError,
  parseBody,
} from "@/lib/route-helpers";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, RegisterRequestSchema);

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ApiException(409, "EMAIL_TAKEN", "A user with this email already exists.");
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(input.password);
    const now = new Date();

    await db.insert(users).values({
      id,
      email: input.email,
      passwordHash,
      name: input.name ?? null,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(userStats).values({
      userId: id,
      streakDays: 0,
    });

    const token = await signJwt({ sub: id, email: input.email });

    const payload = AuthResponseSchema.parse({
      user: { id, email: input.email, name: input.name ?? null },
      token,
    });

    return apiSuccess(payload, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
