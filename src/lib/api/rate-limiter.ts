import { connectToDatabase } from "@/db/mongo";
import { NextRequest } from "next/server";
import { ApiConfig } from "@/config/api";
import Request from "@/db/models/request";

export async function rateLimit(req: NextRequest): Promise<boolean> {
  const client = await connectToDatabase();
  const db = client.db("main");
  const requests = db.collection("requests");

  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "Unknown";
  }

  const currentTime = Date.now();

  const request: Request = {
    ip: ip,
    time: currentTime,
    method: req.method,
    url: req.url,
  };

  await requests.insertOne(request);

  const { allowedRequests, perTime } = ApiConfig.rateLimit;
  const requestsByIp = await requests.countDocuments({
    ip: ip,
    time: { $gte: currentTime - perTime },
  });

  return allowedRequests > requestsByIp;
}
