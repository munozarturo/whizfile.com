import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";
import { sendTransferSchema } from "@/lib/validations/transfer";
import * as z from "zod";
import * as crypto from "crypto";
import { connectToDatabase } from "@/db/mongo";
import { generateRandomString, getTimestamp } from "@/lib/api/utils";

interface AuthPair {
    oneTimeCode: string;
    authenticationHash: string;
    salt: string;
}

function generateAuthPair(): AuthPair {
    const oneTimeCode = generateRandomString(16);
    const salt = generateRandomString(16);

    const hash = crypto.createHash("sha256");
    hash.update(oneTimeCode);
    hash.update(salt);

    return {
        oneTimeCode: oneTimeCode,
        salt: salt,
        authenticationHash: hash.digest("hex"),
    };
}

export async function POST(
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
        const data = await req.json();

        const input = sendTransferSchema.parse(data);

        const client = await connectToDatabase();
        const db = client.db("main");
        const transfers = db.collection("transfers");

        const uniqueTransferId = async () => {
            let transferId = generateRandomString(6);
            while (
                (await transfers.countDocuments({ transferId: transferId })) > 0
            )
                transferId = generateRandomString(6);
            return transferId;
        };

        const authPair = generateAuthPair();

        const transfer = {
            transferId: await uniqueTransferId(),
            createdAt: getTimestamp(),
            title: input.title,
            message: input.message,
            status: "PENDING",
            uploadCodeVerifSalt: authPair.salt,
            uploadCodeVerifHash: authPair.authenticationHash,
            fileKey: null,
        };

        transfers.insertOne(transfer);

        return Response.json(
            {
                data: {
                    transferId: transfer.transferId,
                    oneTimeCode: authPair.oneTimeCode,
                },
                debug: transfer,
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
