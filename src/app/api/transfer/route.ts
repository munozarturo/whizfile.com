import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";
import { transferUploadSchema } from "@/lib/validations/transfer";
import * as z from "zod";
import { connectToDatabase } from "@/db/mongo";

interface TransferData {
  transferId: string;
}

export async function POST(req: NextRequest) {
  if (await rateLimit(req)) {
    return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
  }

  try {
    const input = transferUploadSchema.parse(await req.json());

    const client = await connectToDatabase();
    const db = client.db("main");
    const transfers = db.collection("transfer");

    // generate unique transfer id
    const generateTransferId = () =>
      Array.from({ length: 6 })
        .map(
          () =>
            "0123456789abcdefghijklmnopqrstuvwxyz"[
              Math.floor(Math.random() * 36)
            ]
        )
        .join("");

    let transferId: string = generateTransferId();

    while ((await transfers.countDocuments({ transferId: transferId })) > 0) {
      transferId = generateTransferId();
    }

    const transferData = {
      transferId: transferId,
      createdAt: Date.now(),
      status: "active",
      title: input.title,
      message: input.message,
    };

    await transfers.insertOne(transferData);

    return Response.json(
      {
        message: "Succesfully uploaded transfer.",
        data: { transferId: transferId },
      },
      { status: 200 }
    );
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
