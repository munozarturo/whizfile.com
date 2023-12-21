import {
    getObjectId,
    getTransferUId,
    handleResponse,
    hash,
} from "@/lib/api/utils";
import * as zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { TransferId } from "@/lib/api/validations/transfers";
import { TransferSchema } from "@/lib/db/schema/transfers";
import { S3Client, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import whizfileConfig from "@/lib/config/config";

if (!process.env.UNIVERSAL_SALT) {
    throw new Error("`UNIVERSAL_SALT` environment variable is not defined.");
}

const UNIVERSAL_SALT = process.env.UNIVERSAL_SALT;

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

export async function GET(
    req: NextRequest,
    context: { params: { transferId: string } }
) {
    let transferId: string;
    let collections: Collections;
    let transfers: Collection<zod.infer<typeof TransferSchema>>;
    let transferUId: string;
    let transfer: zod.infer<typeof TransferSchema> | null;
    let objectId: string;
    let buffer: Buffer;

    try {
        transferId = TransferId.parse(context.params.transferId);
    } catch (e: any) {
        return NextResponse.json(
            handleResponse(
                "Invalid `transferId`, `transferId` must contain 6 case sensitive alphanumeric caracters.",
                {
                    transferId: context.params.transferId,
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

        if (transfer.status !== "active") {
            return NextResponse.json(
                handleResponse(
                    "Transfer with associated `transferId` is no longer active.",
                    {
                        transferId: transferId,
                        status: transfer.status,
                    }
                ),
                { status: 410 }
            );
        }
    } catch (e: any) {
        return NextResponse.json(
            handleResponse("Error fetching transfer data for `transferId`.", {
                transferId: transferId,
            }),
            { status: 500 }
        );
    }

    try {
        objectId = getObjectId(transferId, transferUId, transfer.objectIdSalt);
        const s3Client = new S3Client({ region: whizfileConfig.s3.region });
        const command = new GetObjectCommand({
            Bucket: whizfileConfig.s3.bucket,
            Key: objectId,
        });

        const resp = await s3Client.send(command);
        const stream = resp.Body as Readable;
        buffer = await streamToBuffer(stream);

        const digest = hash(buffer);
        const size = buffer.length;

        if (
            digest !== transfer.objectData.fileHash ||
            size !== transfer.objectData.size
        ) {
            await transfers.updateOne(
                { transferUId: transferUId },
                { $set: { status: "corrupted" } }
            );

            return NextResponse.json(
                handleResponse(
                    "Uploaded object does not match promised object shape. Hash or size mismatch. Polluted transfer.",
                    {
                        transferId: transferId,
                        expectedObject: {
                            size: transfer.objectData.size,
                            hash: transfer.objectData.fileHash,
                        },
                        receivedObject: {
                            size: size,
                            hash: digest,
                        },
                    }
                ),
                { status: 409 }
            );
        }
    } catch (e: any) {
        if (e instanceof NoSuchKey) {
            const uploadExpiryTime =
                transfer.timestamp +
                whizfileConfig.s3.presignedUrlExpireIn * 1000;
            const awaitingUpload = Date.now() < uploadExpiryTime;

            if (awaitingUpload) {
                return NextResponse.json(
                    handleResponse(
                        "Awaiting upload for specified `transferId`.",
                        {
                            transferId: transferId,
                            uploadExpiryTime: uploadExpiryTime,
                        }
                    ),
                    { status: 423 }
                );
            }

            await transfers.updateOne(
                { transferUId: transferUId },
                { $set: { status: "failed" } }
            );

            return NextResponse.json(
                handleResponse("Upload expired for transfer `transferId`.", {
                    transferId: transferId,
                }),
                { status: 410 }
            );
        }

        return NextResponse.json(
            handleResponse(
                "Error fetching object associated with `transferId`.",
                { transferId: transferId }
            ),
            { status: 500 }
        );
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set(
        "Content-Disposition",
        `attachment; filename="whizfile_transfer_${transferId}.zip"`
    );

    return new Response(buffer, { headers: headers, status: 200 });
}
