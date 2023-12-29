import * as zod from "zod";

import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TransferSchema, TransferStatus } from "@/lib/db/schema/transfers";
import {
    generateRandomSalt,
    generateTransferId,
    getObjectId,
    getTransferUId,
    handleResponse,
} from "@/lib/api/utils";

import { TransfersReq } from "@/lib/api/validations/transfers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import whizfileConfig from "@/lib/config/config";

if (!process.env.UNIVERSAL_SALT) {
    throw new Error("`UNIVERSAL_SALT` environment variable is not defined.");
}

const UNIVERSAL_SALT = process.env.UNIVERSAL_SALT;

export async function POST(req: NextRequest) {
    let requestBody: Object;
    let body: zod.infer<typeof TransfersReq>;
    let collections: Collections;
    let transfers: Collection<TransferSchema>;
    let transferId: string;
    let document: TransferSchema;
    let transferUId: string;
    let objectIdSalt: string;
    let objectId: string;
    let s3Client: S3Client;
    let presignedUploadUrl: string;

    try {
        requestBody = await req.json();
    } catch (e: any) {
        return NextResponse.json(handleResponse("Bad request body."), {
            status: 400,
        });
    }

    try {
        body = TransfersReq.parse(requestBody);
    } catch (e: any) {
        return NextResponse.json(
            handleResponse("Invalid request body.", {
                requestBody: requestBody,
            }),
            { status: 400 }
        );
    }

    if (body.objectData.size > whizfileConfig.api.transfer.maxSize) {
        return NextResponse.json(
            handleResponse(
                `Transfer size is too large. Limit is ${whizfileConfig.api.transfer.maxSize} bytes.`,
                {
                    requestBody: requestBody,
                }
            ),
            {
                status: 400,
            }
        );
    }

    try {
        collections = await connectToDatabase();
        transfers = collections.transfers;
    } catch (e: any) {
        return NextResponse.json(
            handleResponse(
                "Error connecting to database. Please try again later.",
                {
                    requestBody: requestBody,
                }
            ),
            {
                status: 500,
            }
        );
    }

    try {
        const generateUniqueTransferId = async (): Promise<string> => {
            var transferId = generateTransferId();
            var transferIdHash = getTransferUId(transferId, UNIVERSAL_SALT);

            while (
                (await transfers.countDocuments({
                    transferUId: transferIdHash,
                })) > 0
            ) {
                transferId = generateTransferId();
            }

            return transferId;
        };

        transferId = await generateUniqueTransferId();
    } catch (e: any) {
        return NextResponse.json(
            handleResponse(
                "Error generating unique `transferId` for transfer. Please try again later.",
                {
                    requestBody: requestBody,
                }
            ),
            { status: 500 }
        );
    }

    try {
        transferUId = getTransferUId(transferId, UNIVERSAL_SALT);
        objectIdSalt = generateRandomSalt();
        objectId = getObjectId(transferId, transferUId, objectIdSalt);

        document = {
            transferUId: transferUId,
            timestamp: Date.now(),
            status: TransferStatus.active,

            title: body.title,
            message: body.message,
            objectData: body.objectData,
            allowDelete: body.allowDelete,
            expireIn: body.expireIn,

            views: 0,
            downloads: 0,

            maxViews: body.maxViews,
            maxDownloads: body.maxDownloads,

            objectIdSalt: objectIdSalt,
        };

        await transfers.insertOne(document);
    } catch (e: any) {
        return NextResponse.json(
            handleResponse("Error creating transfer. Please try again later.", {
                requestBody: requestBody,
            }),
            { status: 500 }
        );
    }

    try {
        s3Client = new S3Client({ region: whizfileConfig.s3.region });
        const command = new PutObjectCommand({
            Bucket: whizfileConfig.s3.bucket,
            Key: objectId,
            Metadata: {
                expire: (document.timestamp + document.expireIn).toString(),
                hash: document.objectData.fileHash,
                size: document.objectData.size.toString(),
            },
        });
        presignedUploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: whizfileConfig.s3.presignedUrlExpireIn,
        });
    } catch (e: any) {
        await transfers.updateOne(
            { transferUId: transferUId },
            { $set: { status: TransferStatus.failed } }
        );

        return NextResponse.json(
            handleResponse("Error generating upload link to media server.", {
                requestBody: requestBody,
            }),
            { status: 500 }
        );
    }

    return NextResponse.json(
        handleResponse("Succesfully created transfer.", {
            transferId: transferId,
            upload: { method: "PUT", url: presignedUploadUrl },
        }),
        { status: 200 }
    );
}
