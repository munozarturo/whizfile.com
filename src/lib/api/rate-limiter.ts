import { connectToDatabase } from "@/db/mongo";
import { NextRequest } from "next/server";

export async function applyRateLimit(req: NextRequest) {
  const client = await connectToDatabase();
  const db = client.db("main");
  const requests = db.collection("requests");

  const reqData = {
    ip: req.ip || null,
    method: req.method,
    url: req.url,
    body: await req.json(),
  };

  await requests.insertOne(reqData);
}
