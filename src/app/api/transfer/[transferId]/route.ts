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
