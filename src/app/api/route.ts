import { connectToDatabase } from "@/db/mongo";
import { applyRateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  applyRateLimit(req);

  const client = await connectToDatabase();
  const db = client.db("main");
  const transfers = db.collection("transfers");

  return Response.json({ message: "Hello world" }, { status: 200 });
}
