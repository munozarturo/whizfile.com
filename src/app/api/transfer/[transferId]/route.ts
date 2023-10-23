import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { transferId: string } }
) {
  if (await rateLimit(req)) {
    return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { transferId: string } }
) {
  if (await rateLimit(req)) {
    return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
  }
}
