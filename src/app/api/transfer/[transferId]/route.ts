import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { transferId: string } }
) {
  rateLimit(req);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { transferId: string } }
) {
  rateLimit(req);
}
