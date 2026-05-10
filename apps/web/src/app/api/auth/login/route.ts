import {
  LoginRequestSchema,
  AuthResponseSchema,
} from "@vocab-nest/contracts";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signJwt } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import {
  ApiException,
  apiSuccess,
  handleApiError,
  parseBody,
} from "@/lib/route-helpers";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, LoginRequestSchema);

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    const user = rows[0];
    if (!user) {
      throw new ApiException(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new ApiException(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }

    const token = await signJwt({ sub: user.id, email: user.email });

    const payload = AuthResponseSchema.parse({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });

    return apiSuccess(payload);
  } catch (error) {
    return handleApiError(error);
  }
}
