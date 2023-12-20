import {
    generateRandomSalt,
    generateTransferId,
    getObjectId,
    getTransferUId,
    handleError,
    handleResponse,
} from "@/lib/api/utils";
import * as zod from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Collections, connectToDatabase } from "@/lib/db/mongo";
import { TransfersReq } from "@/lib/api/validations/transfers";
import { TransferIdSchema, TransferSchema } from "@/lib/db/schema/transfers";
import { S3Client, S3ClientConfig, PutObjectCommand } from "@aws-sdk/client-s3";
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
    try {
        const body: zod.infer<typeof TransfersReq> = TransfersReq.parse(
            await req.json()
        );

        const collections: Collections = await connectToDatabase();
        const transferIds: Collection<zod.infer<typeof TransferIdSchema>> =
            collections.transferIds;
        const transfers: Collection<zod.infer<typeof TransferSchema>> =
            collections.transfers;

        const generateUniqueTransferId = async (): Promise<{
            transferId: string;
            hash: string;
        }> => {
            var transferId = generateTransferId();
            var hash = getTransferUId(transferId, UNIVERSAL_SALT);

            while (
                (await transferIds.countDocuments({
                    transferId: hash,
                })) > 0
            ) {
                transferId = generateTransferId();
            }

            return { transferId: transferId, hash: hash };
        };

        const { transferId, hash: transferIdHash } =
            await generateUniqueTransferId();

        const transferUId = getTransferUId(transferId, UNIVERSAL_SALT);

        const objectIdSalt = generateRandomSalt();
        const objectId = getObjectId(transferUId, objectIdSalt);

        const document: zod.infer<typeof TransferSchema> = {
            transferUId: transferUId,
            timestamp: Date.now(),
            status: "active",

            title: body.title,
            message: body.message,
            objectData: body.objectData,

            objectIdSalt: objectIdSalt,
        };

        const s3Config: S3ClientConfig = {
            region: AWS_REGION,
        };
        const s3Client: S3Client = new S3Client(s3Config);

        const command: PutObjectCommand = new PutObjectCommand({
            Bucket: AWS_BUCKET,
            Key: objectId,
        });

        const presignedUploadUrl: string = await getSignedUrl(
            s3Client,
            command,
            {
                expiresIn: 3600,
            }
        );

        await transfers.insertOne(document);
        await transferIds.insertOne({
            transferIdHash: transferIdHash,
        });

        return NextResponse.json(
            handleResponse("Response message.", {
                debug: document,
                debug2: { oId: objectId },
                transferId: transferId,
                uploadUrl: presignedUploadUrl,
            }),
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(handleError(e));
    }
}
