import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";
import * as z from "zod";
import { connectToDatabase } from "@/db/mongo";
import { transferQuerySchema } from "@/lib/validations/transfer";
import Transfer from "@/db/models/transfer";

export async function GET(
  req: NextRequest,
  context: { params: { transferId: string } }
) {
  if (await rateLimit(req)) {
    return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
  }

  try {
    const input = transferQuerySchema.parse(context.params);

    const client = await connectToDatabase();
    const db = client.db("main");
    const transfers = db.collection("transfers");

    const doc: unknown = await transfers.findOne(
      {
        transferId: input.transferId,
      },
      { projection: { _id: 0 } }
    );

    if (doc === null) {
      return Response.json(
        {
          message: "Requested transfer does not exist.",
          data: { transferId: input.transferId },
        },
        { status: 404 }
      );
    }

    const queryResult = doc as Transfer;

    if (queryResult.status === "expired") {
      return Response.json(
        {
          message: "Requested transfer has expired.",
          data: { transferId: input.transferId },
        },
        { status: 410 }
      );
    }

    if (queryResult.status === "deleted") {
      return Response.json(
        {
          message: "Requested transfer has been deleted.",
          data: { transferId: input.transferId },
        },
        { status: 410 }
      );
    }

    return Response.json(queryResult, { status: 200 });
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

export async function DELETE(
  req: NextRequest,
  context: { params: { transferId: string } }
) {
  if (await rateLimit(req)) {
    return Response.json({ message: "Rate limit exceeded." }, { status: 429 });
  }

  try {
    const input = transferQuerySchema.parse(context.params);

    const client = await connectToDatabase();
    const db = client.db("main");
    const transfers = db.collection("transfers");

    const doc: unknown = await transfers.findOne(
      {
        transferId: input.transferId,
      },
      { projection: { _id: 0 } }
    );

    if (doc === null) {
      return Response.json(
        {
          message: "Requested transfer does not exist.",
          data: { transferId: input.transferId },
        },
        { status: 404 }
      );
    }

    const queryResult = doc as Transfer;

    if (queryResult.status === "expired") {
      return Response.json(
        {
          message: "Requested transfer has expired.",
          data: { transferId: input.transferId },
        },
        { status: 410 }
      );
    }

    if (queryResult.status === "deleted") {
      return Response.json(
        {
          message: "Requested transfer has been deleted.",
          data: { transferId: input.transferId },
        },
        { status: 410 }
      );
    }

    await transfers.updateOne(
      { transferId: queryResult.transferId },
      { $set: { status: "deleted" } }
    );

    return Response.json(
      {
        message: "Succesfully deleted transfer.",
        data: { transferId: queryResult.transferId },
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
