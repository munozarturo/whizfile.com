import {
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
import { S3Client, S3ClientConfig, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

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

export async function GET(
    req: NextRequest,
    context: { params: { transferId: string } }
) {
    try {
        const transferId = TransferId.parse(context.params.transferId);

        const collections: Collections = await connectToDatabase();
        const transfers: Collection<zod.infer<typeof TransferSchema>> =
            collections.transfers;

        const transferUId = getTransferUId(transferId, UNIVERSAL_SALT);

        const transfer: zod.infer<typeof TransferSchema> | null =
            await transfers.findOne({ transferUId: transferUId });

        if (!transfer) {
            return NextResponse.json(
                handleResponse(
                    "Transfer with associated transfer id not found."
                )
            );
        }

        const objectId = getObjectId(transferUId, transfer.objectIdSalt);

        const s3Config: S3ClientConfig = {
            region: AWS_REGION,
        };
        const s3Client: S3Client = new S3Client(s3Config);

        const command: GetObjectCommand = new GetObjectCommand({
            Bucket: AWS_BUCKET,
            Key: objectId,
        });

        console.log("searching for", objectId);

        const resp = await s3Client.send(command);
        const stream = resp.Body as Readable;
        const object: Promise<Buffer> = new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks)));
        });
        const buffer = await object;

        const headers = new Headers();
        headers.set("Content-Type", "application/octet-stream");
        headers.set(
            "Content-Disposition",
            `attachment; filename="whizfile_transfer_${transferId}.zip"`
        );

        return new Response(buffer, {
            headers: headers,
            status: 200,
        });
    } catch (e: any) {
        return NextResponse.json(handleError(e));
    }
}
