import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  rateLimit(req);
}
