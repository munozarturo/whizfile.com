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
import whizfileConfig from "@/lib/config/config";

if (!process.env.UNIVERSAL_SALT) {
    throw new Error("`UNIVERSAL_SALT` environment variable is not defined.");
}

const UNIVERSAL_SALT = process.env.UNIVERSAL_SALT;

export async function POST(req: NextRequest) {
    let requestBody: Object;
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

    try {
        collections = await connectToDatabase();
        transferIds = collections.transferIds;
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

        const document: zod.infer<typeof TransferSchema> = {
            transferUId: transferUId,
            timestamp: Date.now(),
            status: "active",

            title: body.title,
            message: body.message,
            objectData: body.objectData,
            allowDelete: body.allowDelete,
            expireIn: body.expireIn,

            views: 0,
            downloads: 0,

            // maxViews
            // maxDownloads

            objectIdSalt: objectIdSalt,
        };

        await transfers.insertOne(document);
        await transferIds.insertOne({ transferIdHash: transferIdHash });
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
        /*
         * Add usage of ChecksumSHA256: "STRING_VALUE", Expires: new Date("TIMESTAMP"),
         * This should avoid any issues with file upload sizes being too large or uploading the incorrect files as well as automatic expires.
         */
        const command = new PutObjectCommand({
            Bucket: whizfileConfig.s3.bucket,
            Key: objectId,
        });
        presignedUploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: whizfileConfig.s3.presignedUrlExpireIn,
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
        handleResponse("Succesfully created transfer.", {
            transferId: transferId,
            upload: { method: "PUT", url: presignedUploadUrl },
        }),
        { status: 200 }
    );
}
