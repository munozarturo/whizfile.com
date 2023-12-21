import {
    generateRandomSalt,
    generateTransferId,
    getObjectId,
    getTransferUId,
    handleResponse,
} from "@/lib/api/utils";
import * as zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { TransfersReq } from "@/lib/api/validations/transfers";
import { TransferIdSchema, TransferSchema } from "@/lib/db/schema/transfers";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.UNIVERSAL_SALT) {
    throw new Error("`UNIVERSAL_SALT` environment variable is not defined.");
}

const UNIVERSAL_SALT = process.env.UNIVERSAL_SALT;

if (!process.env.AWS_BUCKET) {
    throw new Error("`AWS_BUCKET` environment variable is not defined.");
}

const AWS_BUCKET = process.env.AWS_BUCKET;

if (!process.env.AWS_REGION) {
    throw new Error("`AWS_REGION` environment variable is not defined.");
}

const AWS_REGION = process.env.AWS_REGION;

export async function POST(req: NextRequest) {
    let requestBody: Object = await req.json();
    let body: zod.infer<typeof TransfersReq>;
    let collections: Collections;
    let transferIds: Collection<zod.infer<typeof TransferIdSchema>>;
    let transfers: Collection<zod.infer<typeof TransferSchema>>;
    let transferId: string;
    let transferIdHash: string;
    let transferUId: string;
    let objectIdSalt: string;
    let objectId: string;
    let s3Client: S3Client;
    let presignedUploadUrl: string;

    try {
        body = TransfersReq.parse(requestBody);
    } catch (e: any) {
        return NextResponse.json(
            handleResponse("Invalid `requestBody`.", {
                requestBody: requestBody,
            }),
            { status: 400 }
        );
    }

    try {
        collections = await connectToDatabase();
        transferIds = collections.transferIds;
        transfers = collections.transfers;
    } catch (e: any) {
        return NextResponse.json(
            handleResponse("Error fetching transfer. Please try again later.", {
                requestBody: requestBody,
            }),
            {
                status: 500,
            }
        );
    }

    try {
        const generateUniqueTransferId = async (): Promise<{
            transferId: string;
            transferIdHash: string;
        }> => {
            var transferId = generateTransferId();
            var transferIdHash = getTransferUId(transferId, UNIVERSAL_SALT);

            while (
                (await transferIds.countDocuments({
                    transferId: transferIdHash,
                })) > 0
            ) {
                transferId = generateTransferId();
            }

            return { transferId: transferId, transferIdHash: transferIdHash };
        };

        ({ transferId, transferIdHash } = await generateUniqueTransferId());
    } catch (e: any) {
        return NextResponse.json(
            handleResponse(
                "Error generating unique `transferId` for transfer.",
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
        objectId = getObjectId(transferUId, objectIdSalt);

        const document: zod.infer<typeof TransferSchema> = {
            transferUId: transferUId,
            timestamp: Date.now(),
            status: "active",

            title: body.title,
            message: body.message,
            objectData: body.objectData,

            objectIdSalt: objectIdSalt,
        };

        await transfers.insertOne(document);
        await transferIds.insertOne({ transferIdHash: transferIdHash });
    } catch (e: any) {
        return NextResponse.json(
            handleResponse("Error creating transfer.", {
                requestBody: requestBody,
            }),
            { status: 500 }
        );
    }

    try {
        s3Client = new S3Client({ region: AWS_REGION });
        const command = new PutObjectCommand({
            Bucket: AWS_BUCKET,
            Key: objectId,
        });
        presignedUploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60,
        });
    } catch (e: any) {
        await transfers.updateOne(
            { transferUId: transferUId },
            { $set: { status: "failed" } }
        );

        return NextResponse.json(
            handleResponse("Error generating upload link to media server.", {
                requestBody: requestBody,
            }),
            { status: 500 }
        );
    }

    return NextResponse.json(
        handleResponse("Response message.", {
            transferId: transferId,
            upload: { method: "PUT", url: presignedUploadUrl },
        }),
        { status: 200 }
    );
}
