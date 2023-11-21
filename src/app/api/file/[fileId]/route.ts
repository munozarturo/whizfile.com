import { connectToDatabase } from "@/db/mongo";
import { s3Client } from "@/db/s3client";
import { rateLimit } from "@/lib/api/rate-limiter";
import { fileQuerySchema } from "@/lib/validations/transfer";
import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";

async function getObject(bucketName: string, objectKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
  });

  const response = await s3Client.send(command);
  const stream = response.Body as ReadableStream;

  // Convert the stream to a buffer for easier use in your application
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  let readResult: ReadableStreamReadResult<Uint8Array>;
  while (!(readResult = await reader.read()).done) {
      chunks.push(readResult.value);
  }
  return Buffer.concat(chunks);
}

export async function GET(
    req: NextRequest,
    context: { readonly params: { readonly fileId: string } }
  ) {
    if (await rateLimit(req)) {
      return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
    }

    try {
      const input = fileQuerySchema.parse({
        fileId: context.params.fileId,
      })

      const client = await connectToDatabase();
      const db = client.db("main");
      const transfers = db.collection("transfers");

      const bucketName = "whizfile-com-transfers";
      const key = input.fileId;

      const buffer = await getObject(bucketName, key);

      return Response.json({fileId: input.fileId}, { status: 200 });
    } catch (error) {
      console.log(error);
  
      return Response.json(
        { message: "Unknown error.", data: {} },
        { status: 500 }
      );
    }
  }