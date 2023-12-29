import { Collections, connectToDatabase } from "@/lib/db/mongo";
import { GetObjectCommand, NoSuchKey, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { TransferSchema, TransferStatus } from "@/lib/db/schema/transfers";
import {
    fetchTransfer,
    getObjectId,
    handleResponse,
    hash,
    streamToBuffer,
} from "@/lib/api/utils";

import { APIError } from "@/lib/api/errors";
import { Readable } from "stream";
import { TransferId } from "@/lib/api/validations/transfers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import whizfileConfig from "@/lib/config/config";

if (!process.env.UNIVERSAL_SALT) {
    throw new Error("`UNIVERSAL_SALT` environment variable is not defined.");
}

const UNIVERSAL_SALT = process.env.UNIVERSAL_SALT;

export async function GET(
    req: NextRequest,
    context: { params: { transferId: string } }
) {
    let objectId: string;
    let presignedDownloadUrl: string;

    let transferId: string;
    let collections: Collections;
    let document: TransferSchema | null;

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

    // s3Client = new S3Client({ region: whizfileConfig.s3.region });
    // const command = new PutObjectCommand({
    //     Bucket: whizfileConfig.s3.bucket,
    //     Key: objectId,
    //     Metadata: {
    //         expire: (document.timestamp + document.expireIn).toString(),
    //     },
    // });
    // presignedUploadUrl = await getSignedUrl(s3Client, command, {
    //     expiresIn: whizfileConfig.s3.presignedUrlExpireIn,
    // });

    try {
        objectId = getObjectId(
            transferId,
            document.transferUId,
            document.objectIdSalt
        );
        const s3Client = new S3Client({ region: whizfileConfig.s3.region });
        const command = new GetObjectCommand({
            Bucket: whizfileConfig.s3.bucket,
            Key: objectId,
        });

        presignedDownloadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: whizfileConfig.s3.presignedUrlExpireIn,
        });
    } catch (e: any) {
        if (e instanceof NoSuchKey) {
            const uploadExpiryTime =
                document.timestamp +
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

            await collections.transfers.updateOne(
                { transferUId: document.transferUId },
                { $set: { status: TransferStatus.failed } }
            );

            return NextResponse.json(
                handleResponse("Upload expired for transfer `transferId`.", {
                    transferId: transferId,
                }),
                { status: 410 }
            );
        }

        return NextResponse.json(
            handleResponse("Error generating download URL for transfer.", {
                transferId: transferId,
            }),
            { status: 500 }
        );
    }

    await collections.transfers.updateOne(
        { transferUId: document.transferUId },
        { $inc: { downloads: 1 } }
    );

    return NextResponse.json(
        handleResponse("Succesfully fetched transfer object.", {
            transferId: transferId,
            download: { method: "GET", url: presignedDownloadUrl },
        })
    );
}
