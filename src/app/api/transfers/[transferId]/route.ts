import {
    generateTransferId,
    getObjectId,
    getTransferUId,
    handleError,
    handleResponse,
} from "@/lib/api/utils";
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

        // api endpoint body

        // standard response
        return NextResponse.json(
            handleResponse("Response message.", {
                transferId: transferId,
            }),
            {
                status: 200,
            }
        );
    } catch (e: any) {
        return NextResponse.json(handleError(e));
    }
}
