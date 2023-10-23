import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  if (await rateLimit(req)) {
    return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
  }
}
