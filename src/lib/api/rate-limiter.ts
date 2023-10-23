import { connectToDatabase } from "@/db/mongo";
import { NextRequest } from "next/server";

export async function rateLimit(req: NextRequest) {
  const client = await connectToDatabase();
  const db = client.db("main");
  const requests = db.collection("requests");

  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "Unknown";
  }

  const reqData = {
    ip: ip,
    method: req.method,
    url: req.url,
  };

  await requests.insertOne(reqData);
}
