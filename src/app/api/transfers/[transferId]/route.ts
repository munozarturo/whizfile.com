import {
    generateRandomSalt,
    getObjectId,
    getTransferUId,
    handleResponse,
} from "@/lib/api/utils";
import * as zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { TransferId } from "@/lib/api/validations/transfers";
import { TransferSchema } from "@/lib/db/schema/transfers";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
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
    let transfers: Collection<zod.infer<typeof TransferSchema>>;
    let transferUId;
    let document: zod.infer<typeof TransferSchema> | null;
    let expiresIn: number;
    let objectId: string;
    let s3Client: S3Client;

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

        await transfers.updateOne(
            { transferUId: transferUId },
            { $inc: { views: 1 } }
        );

        document = await transfers.findOne(
            { transferUId: transferUId },
            {
                projection: {
                    _id: 0,
                    timestamp: 1,
                    status: 1,
                    title: 1,
                    message: 1,
                    objectData: 1,
                    allowDelete: 1,
                    expireIn: 1,
                    objectIdSalt: 1,
                    views: 1,
                    downloads: 1,
                },
            }
        );

        // maxViews
        // maxDownloads

        if (!document) {
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

        expiresIn = document.timestamp + document.expireIn - Date.now();

        if (expiresIn <= 0) {
            try {
                await transfers.updateOne(
                    { transferUId: transferUId },
                    { $set: { status: "expired" } }
                );
                document.status = "expired";
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
                transferUId = getTransferUId(transferId, UNIVERSAL_SALT);
                objectId = getObjectId(
                    transferId,
                    transferUId,
                    document.objectIdSalt
                );

                s3Client = new S3Client({ region: whizfileConfig.s3.region });
                const command = new DeleteObjectCommand({
                    Bucket: whizfileConfig.s3.bucket,
                    Key: objectId,
                });
                s3Client.send(command);
            } catch (e: any) {
                await transfers.updateOne(
                    { transferUId: transferUId },
                    { $set: { status: "removed" } }
                );

                return NextResponse.json(
                    handleResponse("Error deleting object from media server.", {
                        transferId: transferId,
                    }),
                    { status: 500 }
                );
            }
        }

        if (document.status !== "active") {
            return NextResponse.json(
                handleResponse(
                    "Transfer with associated `transferId` is not active.",
                    {
                        transferId: transferId,
                        status: document.status,
                    }
                ),
                { status: 410 }
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

    const { objectIdSalt, ...transfer } = document;

    return NextResponse.json(
        handleResponse(
            "Sucessfully fetched transfer with provided `transferId`.",
            {
                transferId: transferId,
                transfer: { ...transfer, expiresIn: expiresIn },
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
    let transfers: Collection<zod.infer<typeof TransferSchema>>;
    let transferUId;
    let transfer: zod.infer<typeof TransferSchema> | null;
    let expiresIn: number;
    let objectId: string;
    let s3Client: S3Client;

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
        transfer = await transfers.findOne({ transferUId: transferUId });

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

        expiresIn = transfer.timestamp + transfer.expireIn - Date.now();

        if (expiresIn <= 0) {
            try {
                await transfers.updateOne(
                    { transferUId: transferUId },
                    { $set: { status: "expired" } }
                );
                transfer.status = "expired";
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
                transferUId = getTransferUId(transferId, UNIVERSAL_SALT);
                objectId = getObjectId(
                    transferId,
                    transferUId,
                    transfer.objectIdSalt
                );

                s3Client = new S3Client({ region: whizfileConfig.s3.region });
                const command = new DeleteObjectCommand({
                    Bucket: whizfileConfig.s3.bucket,
                    Key: objectId,
                });
                s3Client.send(command);
            } catch (e: any) {
                await transfers.updateOne(
                    { transferUId: transferUId },
                    { $set: { status: "removed" } }
                );

                return NextResponse.json(
                    handleResponse("Error deleting object from media server.", {
                        transferId: transferId,
                    }),
                    { status: 500 }
                );
            }
        }

        if (transfer.status !== "active") {
            return NextResponse.json(
                handleResponse(
                    "Transfer with associated `transferId` is not active. Can only delete an active transfer.",
                    {
                        transferId: transferId,
                        status: transfer.status,
                    }
                ),
                { status: 410 }
            );
        }

        if (!transfer.allowDelete) {
            return NextResponse.json(
                handleResponse(
                    "Transfer with associated `transferId` can't be deleted.",
                    {
                        transferId: transferId,
                        transferAllowsDelete: transfer.allowDelete,
                    }
                ),
                { status: 400 }
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

    try {
        await transfers.updateOne(
            { transferUId: transferUId },
            { $set: { status: "deleted" } }
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
        transferUId = getTransferUId(transferId, UNIVERSAL_SALT);
        objectId = getObjectId(transferId, transferUId, transfer.objectIdSalt);

        s3Client = new S3Client({ region: whizfileConfig.s3.region });
        const command = new DeleteObjectCommand({
            Bucket: whizfileConfig.s3.bucket,
            Key: objectId,
        });
        s3Client.send(command);
    } catch (e: any) {
        await transfers.updateOne(
            { transferUId: transferUId },
            { $set: { status: "removed" } }
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
