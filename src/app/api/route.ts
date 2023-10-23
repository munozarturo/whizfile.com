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

export async function POST(req: NextRequest) {
  const data = await req.formData();

  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return Response.json({ message: "no file" }, { status: 200 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const s3 = new S3();

  await s3
    .putObject({
      Body: buffer,
      Bucket: "whizfile-com-transfers",
      Key: file.name,
    })
    .promise();

  return Response.json({ message: "ok" }, { status: 200 });
}
