import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";
import * as crypto from "crypto";

import * as zod from "zod";
import { fileUploadSchema } from "@/lib/validations/transfer";
import { connectToDatabase } from "@/db/mongo";
import { S3 } from "aws-sdk";

function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function hashFileWithMeta(buffer: Buffer, algorithm: string = "sha256"): string {
    const hash = crypto.createHash(algorithm);
    hash.update(buffer);
    hash.update(Date.now().toString())
    hash.update(generateRandomString(6));
    return hash.digest("hex");
}

async function blobOrFileToBuffer(blobOrFile: any): Promise<Buffer> {
  if (!(blobOrFile instanceof Blob || blobOrFile instanceof File)) {
    throw new Error("Expected type of `blobOrFile` to be Blob or File.");
  }

  return Buffer.from(await blobOrFile.arrayBuffer());
}

export async function POST(
    req: NextRequest,
  ) {
    if (await rateLimit(req)) {
      return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
    }

    try {
        const data = await req.formData();

        const input = fileUploadSchema.parse({
          file: data.get("file"),
        });

        const client = await connectToDatabase();
        const db = client.db("main");
        const transfers = db.collection("transfers");

        const file = input.file;

        const buffer: Buffer = await blobOrFileToBuffer(file);

        const s3 = new S3();
        const bucketName = "whizfile-com-transfers";
        const key = hashFileWithMeta(buffer);

        await s3.putObject({
          Body: buffer,
          Bucket: bucketName,
          Key: `${key}.zip`
        }).promise();

        return Response.json({fileId: key}, { status: 200 });
    } catch (error) {
      console.log(error);

      if (error instanceof zod.ZodError)
      return Response.json(error, { status: 422 });
  
      return Response.json(
        { message: "Unknown error.", data: {} },
        { status: 500 }
      );
    }
  }