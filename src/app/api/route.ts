import { connectToDatabase } from "@/db/mongo";
import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";
import { S3 } from "aws-sdk";

export async function GET(req: NextRequest) {
  const client = await connectToDatabase();
  const db = client.db("main");
  const transfers = db.collection("transfers");

  const s3 = new S3();

  await s3
    .putObject({
      Body: "Hello world",
      Bucket: "whizfile-com-transfers",
      Key: "some-file.txt",
    })
    .promise();

  return Response.json({ message: "Hello world" }, { status: 200 });
}
