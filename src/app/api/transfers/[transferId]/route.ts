import { getTransferUId, handleError, handleResponse } from "@/lib/api/utils";
import * as zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { TransferId } from "@/lib/api/validations/transfers";
import { TransferSchema } from "@/lib/db/schema/transfers";

if (!process.env.UNIVERSAL_SALT) {
    throw new Error("`UNIVERSAL_SALT` environment variable is not defined.");
}

const UNIVERSAL_SALT = process.env.UNIVERSAL_SALT;

export async function GET(
    req: NextRequest,
    context: { params: { transferId: string } }
) {
    try {
        const transferId = TransferId.parse(context.params.transferId);

        const collections: Collections = await connectToDatabase();
        const transfers: Collection<zod.infer<typeof TransferSchema>> =
            collections.transfers;

        const transferUId = getTransferUId(transferId, UNIVERSAL_SALT);

        const document: zod.infer<typeof TransferSchema> | null =
            await transfers.findOne(
                { transferUId: transferUId },
                {
                    projection: {
                        _id: 0,
                        timestamp: 1,
                        status: 1,
                        title: 1,
                        message: 1,
                        objectData: 1,
                    },
                }
            );

        if (!document) {
            return NextResponse.json(
                handleResponse(
                    "Transfer with associated transfer id not found."
                )
            );
        }

        return NextResponse.json(handleResponse("Found transfer.", document), {
            status: 200,
        });
    } catch (e: any) {
        return NextResponse.json(handleError(e));
    }
}
