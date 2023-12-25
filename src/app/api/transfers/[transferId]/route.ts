import { Collections, connectToDatabase } from "@/lib/db/mongo";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { TransferSchema, TransferStatus } from "@/lib/db/schema/transfers";
import {
    fetchTransfer,
    getObjectId,
    getTransferUId,
    handleResponse,
} from "@/lib/api/utils";

import { APIError } from "@/lib/api/errors";
import { TransferId } from "@/lib/api/validations/transfers";
import whizfileConfig from "@/lib/config/config";

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
    let document: TransferSchema | null;

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

    collections = await connectToDatabase();

    try {
        document = await fetchTransfer(transferId, UNIVERSAL_SALT, collections);
    } catch (e: any) {
        if (e instanceof APIError) {
            return NextResponse.json(
                handleResponse(e.message, {
                    transferId: transferId,
                }),
                { status: e.status }
            );
        } else {
            return NextResponse.json(
                handleResponse("Unknown error.", {
                    transferId: transferId,
                }),
                { status: 500 }
            );
        }
    }

    await collections.transfers.updateOne(
        { transferUId: document.transferUId },
        { $inc: { views: 1 } }
    );

    document.views += 1;

    const { transferUId, objectIdSalt, ...transfer } = document;

    return NextResponse.json(
        handleResponse(
            "Sucessfully fetched transfer with provided `transferId`.",
            {
                transferId: transferId,
                transfer: transfer,
            }
        ),
        {
            status: 200,
        }
    );
}

export async function DELETE(
    req: NextRequest,
    context: { params: { transferId: string } }
) {
    let transferId;
    let collections: Collections;
    let document: TransferSchema | null;

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

    collections = await connectToDatabase();

    try {
        document = await fetchTransfer(transferId, UNIVERSAL_SALT, collections);
    } catch (e: any) {
        if (e instanceof APIError) {
            return NextResponse.json(
                handleResponse(e.message, {
                    transferId: transferId,
                }),
                { status: e.status }
            );
        } else {
            return NextResponse.json(
                handleResponse("Unknown error.", {
                    transferId: transferId,
                }),
                { status: 500 }
            );
        }
    }

    if (!document.allowDelete) {
        return NextResponse.json(
            handleResponse(
                "Transfer with associated `transferId` can't be deleted.",
                {
                    transferId: transferId,
                    transferAllowsDelete: document.allowDelete,
                }
            ),
            { status: 400 }
        );
    }

    const tUId: string = getTransferUId(transferId, UNIVERSAL_SALT);
    const oId: string = getObjectId(transferId, tUId, document.objectIdSalt);

    try {
        await collections.transfers.updateOne(
            { transferUId: tUId },
            { $set: { status: TransferStatus.deleted } }
        );
    } catch (e: any) {
        return NextResponse.json(
            handleResponse(
                "Error deleting transfer from server. Please try again later.",
                {
                    transferId: transferId,
                }
            ),
            { status: 500 }
        );
    }

    try {
        const s3Client = new S3Client({ region: whizfileConfig.s3.region });
        const command = new DeleteObjectCommand({
            Bucket: whizfileConfig.s3.bucket,
            Key: oId,
        });
        s3Client.send(command);
    } catch (e: any) {
        await collections.transfers.updateOne(
            { transferUId: tUId },
            { $set: { status: TransferStatus.removed } }
        );

        return NextResponse.json(
            handleResponse("Error deleting object from media server.", {
                transferId: transferId,
            }),
            { status: 500 }
        );
    }

    return NextResponse.json(
        handleResponse(
            "Sucessfully deleted transfer with provided `transferId`.",
            { transferId: transferId }
        ),
        {
            status: 200,
        }
    );
}
