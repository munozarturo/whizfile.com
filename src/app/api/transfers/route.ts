import { handleError, handleResponse } from "@/lib/api/utils";
import * as zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { TransfersReq } from "@/lib/api/validations/transfers";
import { TransferIdSchema, TransferSchema } from "@/lib/db/schema/transfers";
import { createHash, randomBytes } from "crypto";

if (!process.env.UNIVERSAL_SALT) {
    throw new Error("`UNIVERSAL_SALT` environment variable is not defined.");
}

const UNIVERSAL_SALT = process.env.UNIVERSAL_SALT;

function generateTransferId(): { transferId: string; hash: string } {
    var transferId = "";
    const validChars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < 6; i++) {
        transferId += validChars[Math.floor(Math.random() * validChars.length)];
    }

    const hash = createHash("sha256");
    hash.update(transferId);
    hash.update(UNIVERSAL_SALT);
    const transferIdHash = hash.digest("hex");

    return { transferId: transferId, hash: transferIdHash };
}

function generateRandomSalt(size: number = 64): string {
    return randomBytes(size / 2).toString("hex");
}

export async function POST(req: NextRequest) {
    try {
        const body: zod.infer<typeof TransfersReq> = TransfersReq.parse(
            await req.json()
        );

        const collections: Collections = await connectToDatabase();
        const transferIds: Collection<zod.infer<typeof TransferIdSchema>> =
            collections.transferIds;
        const transfers: Collection<zod.infer<typeof TransferSchema>> =
            collections.transfers;

        const generateUniqueTransferId = async (): Promise<string> => {
            var transferId = generateTransferId();

            while (
                (await transferIds.countDocuments({
                    transferId: transferId.hash,
                })) > 0
            ) {
                transferId = generateTransferId();
            }

            await transferIds.insertOne({
                transferIdHash: transferId.hash,
            });

            return transferId.transferId;
        };

        const transferId = await generateUniqueTransferId();

        const hash = createHash("sha256");
        hash.update(transferId);
        hash.update(UNIVERSAL_SALT);
        const transferUId = hash.digest("hex");

        const objectIdSalt = generateRandomSalt();

        const document: zod.infer<typeof TransferSchema> = {
            transferUId: transferUId,
            timestamp: Date.now(),
            status: "active",

            title: body.title,
            message: body.message,
            objectData: body.objectData,

            objectIdSalt: objectIdSalt,
        };

        const uploadUrl = "not generated";

        return NextResponse.json(
            handleResponse("Response message.", {
                debug: document,
                transferId: transferId,
                uploadUrl: uploadUrl,
            }),
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(handleError(e));
    }
}
