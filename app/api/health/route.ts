import { getHealthPayload } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getHealthPayload(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
