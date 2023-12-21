import { getTransferUId, handleResponse } from "@/lib/api/utils";
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
    let transferId;
    let collections: Collections;
    let transfers: Collection<zod.infer<typeof TransferSchema>>;
    let transferUId;
    let transfer: zod.infer<typeof TransferSchema> | null;

    try {
        transferId = TransferId.parse(context.params.transferId);
    } catch (e: any) {
        return NextResponse.json(
            handleResponse(
                "Invalid `transferId`, `transferId` must contain 6 case sensitive alphanumeric caracters.",
                {
                    transferId: transferId,
                }
            ),
            { status: 400 }
        );
    }

    try {
        collections = await connectToDatabase();
        transfers = collections.transfers;

        transferUId = getTransferUId(transferId, UNIVERSAL_SALT);
        transfer = await transfers.findOne(
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

        if (!transfer) {
            return NextResponse.json(
                handleResponse(
                    "Transfer with associated `transferId` not found.",
                    {
                        transferId: transferId,
                    }
                ),
                { status: 404 }
            );
        }

        if (transfer.status !== "active") {
            return NextResponse.json(
                handleResponse(
                    "Transfer with associated `transferId` is no longer active.",
                    {
                        transferId: transferId,
                        status: transfer.status,
                    }
                ),
                { status: 404 }
            );
        }
    } catch (e: any) {
        return NextResponse.json(
            handleResponse("Error fetching transfer. Please try again later.", {
                transferId: transferId,
            }),
            {
                status: 500,
            }
        );
    }

    return NextResponse.json(
        handleResponse(
            "Sucessfully fetched transfer with provided `transferId`.",
            { transferId: transferId, transfer: transfer }
        ),
        {
            status: 200,
        }
    );
}
