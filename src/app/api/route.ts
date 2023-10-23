import { connectToDatabase } from "@/db/mongo";
import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  rateLimit(req);

  const client = await connectToDatabase();
  const db = client.db("main");
  const transfers = db.collection("transfers");

  return Response.json({ message: "Hello world" }, { status: 200 });
}
