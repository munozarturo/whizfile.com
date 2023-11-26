import { rateLimit } from "@/lib/api/rate-limiter";
import { NextRequest } from "next/server";
import * as crypto from "crypto";

import * as zod from "zod";
import { fileUploadSchema } from "@/lib/validations/transfer";
import { connectToDatabase } from "@/db/mongo";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/db/s3client";
import { generateRandomString } from "@/lib/api/utils";
import Transfer from "@/db/models/transfer";
import { ApiConfig } from "@/config/api";

export const config = {
    api: {
        limits: {
            bodyParser: "50mb", // Increase this value according to your needs
        },
    },
};

function hashFileWithMeta(
    buffer: Buffer,
    algorithm: string = "sha256"
): string {
    const hash = crypto.createHash(algorithm);
    hash.update(buffer);
    hash.update(Date.now().toString());
    hash.update(generateRandomString(6));
    return hash.digest("hex");
}

function verifyAuthPair(
    oneTimeCode: string,
    salt: string,
    expectedHash: string
): boolean {
    const hash = crypto.createHash("sha256");
    hash.update(oneTimeCode);
    hash.update(salt);

    return hash.digest("hex") == expectedHash;
}

async function blobOrFileToBuffer(blobOrFile: any): Promise<Buffer> {
    if (!(blobOrFile instanceof Blob || blobOrFile instanceof File)) {
        throw new Error("Expected type of `blobOrFile` to be Blob or File.");
    }

    return Buffer.from(await blobOrFile.arrayBuffer());
}

async function putObject(
    buffer: Buffer,
    bucketName: string,
    objectKey: string
) {
    const command = new PutObjectCommand({
        Body: buffer,
        Bucket: bucketName,
        Key: objectKey,
    });

    const response = await s3Client.send(command);
}

export async function POST(req: NextRequest) {
    if (await rateLimit(req)) {
        return Response.json(
            { message: "Rate limit exceeded." },
            { status: 429 }
        );
    }

    try {
        const data = await req.formData();

        const input = fileUploadSchema.parse({
            file: data.get("file"),
            transferId: data.get("transferId"),
            oneTimeCode: data.get("oneTimeCode"),
        });

        const client = await connectToDatabase();
        const db = client.db("main");
        const transfers = db.collection("transfers");

        const doc: unknown = await transfers.findOne({
            transferId: input.transferId,
        });

        if (doc === null) {
            return Response.json(
                {
                    message: "Requested transfer does not exist",
                    data: { transferId: input.transferId },
                },
                { status: 404 }
            );
        }

        const queryResult = doc as Transfer;

        if (queryResult.status !== "PENDING") {
            return Response.json(
                {
                    message: "Transfer is not pending file upload.",
                    data: { transferId: input.transferId },
                },
                { status: 401 }
            );
        }

        if (
            !verifyAuthPair(
                input.oneTimeCode,
                queryResult.auth.uploadCodeVerifSalt,
                queryResult.auth.uploadCodeVerifHash
            )
        ) {
            return Response.json(
                {
                    message: "Invalid One Time Upload Code.",
                    data: { transferId: input.transferId },
                },
                { status: 401 }
            );
        }

        const file = input.file;

        const buffer: Buffer = await blobOrFileToBuffer(file);
        const sizeInBytes: number = buffer.length;

        if (sizeInBytes > ApiConfig.fileUpload.maxUploadSize) {
            return Response.json(
                {
                    message: "Uploaded file is too large.",
                    data: { transferId: input.transferId },
                },
                { status: 400 }
            );
        }

        const bucketName = "whizfile-com-transfers";
        const key = hashFileWithMeta(buffer);

        await putObject(buffer, bucketName, `${key}.zip`);

        await transfers.updateOne(
            { transferId: input.transferId },
            { $set: { fileKey: key, status: "ACTIVE" } }
        );

        return Response.json({ fileId: key }, { status: 200 });
    } catch (error) {
        console.log(error);

        if (error instanceof zod.ZodError)
            return Response.json(error, { status: 422 });

        return Response.json(
            { message: "Unknown error.", data: {} },
            { status: 500 }
        );
    }
}
