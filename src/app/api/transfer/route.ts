import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";
import { transferUploadSchema } from "@/lib/validations/transfer";
import * as z from "zod";
import { connectToDatabase } from "@/db/mongo";
import { S3 } from "aws-sdk";

export async function POST(
  req: NextRequest,
  context: { params: { transferId: string } }
) {
  if (await rateLimit(req)) {
    return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
  }

  try {
    return Response.json({message: "Hello API"}, { status: 200 });
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError)
      return Response.json(error, { status: 422 });

    return Response.json(
      { message: "Unknown error.", data: {} },
      { status: 500 }
    );
  }
}