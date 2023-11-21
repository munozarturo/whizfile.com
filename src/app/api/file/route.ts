import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";
import * as crypto from "crypto";

import * as zod from "zod";
import { fileUploadSchema } from "@/lib/validations/transfer";
import { connectToDatabase } from "@/db/mongo";
import { S3 } from "aws-sdk";

function hashFileWithMeta(input: Blob, algorithm: string = "sha256"): string {
    const hash = crypto.createHash(algorithm);
    hash.update(Date.now().toString())
    return hash.digest("hex");
}

export async function POST(
    req: NextRequest,
  ) {
    if (await rateLimit(req)) {
      return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
    }

    try {
        const data = await req.formData();

        const input = fileUploadSchema.parse(data);

        const client = await connectToDatabase();
        const db = client.db("main");
        const transfers = db.collection("transfers");

        const file = input.file;
        const buffer = Buffer.from(await file.arrayBuffer());

        const s3 = new S3();
        const bucketName = "whizfile-com-transfers";
        const key = hashFileWithMeta(file);

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