import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";
import * as z from "zod";
import { connectToDatabase } from "@/db/mongo";
import { transferQuerySchema } from "@/lib/validations/transfer";
import Transfer from "@/db/models/transfer";

// https://stackoverflow.com/questions/76379368/how-can-i-upload-images-to-an-amazon-s3-bucket-using-next-js-13s-app-router-and

export async function GET(
    req: NextRequest,
    context: { params: { transferId: string } }
) {
    if (await rateLimit(req)) {
        return Response.json(
            { message: "Rate limit exceeded." },
            { status: 429 }
        );
    }

    try {
        const input = transferQuerySchema.parse({
            transferId: context.params.transferId,
        });

        const client = await connectToDatabase();
        const db = client.db("main");
        const transfers = db.collection("transfers");

        const doc: unknown = await transfers.findOne(
            {
                transferId: input.transferId,
            },
            {
                projection: {
                    _id: 0,
                    auth: 0,
                },
            }
        );

        if (doc === null) {
            return Response.json(
                {
                    message: "Requested transfer does not exist",
                    data: { transferId: input.transferId },
                },
                { status: 404 }
            );
        }

        const queryResult = doc as Transfer;

        if (
            queryResult.status !== "PENDING" &&
            queryResult.status !== "ACTIVE"
        ) {
            return Response.json(
                {
                    message: "Transfer is not accessible.",
                    data: { transferId: input.transferId },
                },
                { status: 401 }
            );
        }

        return Response.json(
            { message: "Transfer retrieved successfuly.", data: queryResult },
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

export async function DELETE(
    req: NextRequest,
    context: { params: { transferId: string } }
) {
    if (await rateLimit(req)) {
        return Response.json(
            { message: "Rate limit exceeded." },
            { status: 429 }
        );
    }

    try {
        return Response.json({ message: "Hello API" }, { status: 200 });
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
