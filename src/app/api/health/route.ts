import { apiSuccess } from "@/lib/route-helpers";

export async function GET() {
  return apiSuccess({ ok: true });
}
