import * as zod from "zod";

import {
    APIError,
    InactiveTransferError,
    InfrastructureError,
    InvalidRequestError,
    NonExistentTransferError,
} from "@/lib/api/errors";
import { BinaryLike, createHash, randomBytes } from "crypto";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
    ProcessedTransfer,
    TransferSchema,
    TransferStatus,
} from "@/lib/db/schema/transfers";

import { Collections } from "@/lib/db/mongo";
import { Readable } from "stream";
import { TransferId } from "@/lib/api/validations/transfers";
import whizfileConfig from "@/lib/config/config";

interface ApiResponse {
    timestamp: number;
    message: string;
    data: Object | null;
}

function handleResponse(
    message: string,
    data: Object | null = null
): ApiResponse {
    return {
        timestamp: Date.now(),
        message: message,
        data: data,
    };
}

function getTransferUId(transferId: string, salt: string): string {
    const hash = createHash("sha256");
    hash.update(transferId);
    hash.update(salt);
    return hash.digest("hex");
}

function getObjectId(
    transferId: string,
    transferUId: string,
    salt: string
): string {
    const hash = createHash("sha256");
    hash.update(transferId);
    hash.update(transferUId);
    hash.update(salt);
    return hash.digest("hex");
}

function generateTransferId(): string {
    var transferId = "";
    const validChars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < 6; i++) {
        transferId += validChars[Math.floor(Math.random() * validChars.length)];
    }

    return transferId;
}

function generateRandomSalt(size: number = 64): string {
    return randomBytes(size / 2).toString("hex");
}

function hash(data: BinaryLike): string {
    const hash = createHash("sha256");
    hash.update(data);
    const digest = hash.digest("hex");
    return digest;
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

async function fetchTransfer(
    transferId: string,
    universalSalt: string,
    collections: Collections
): Promise<ProcessedTransfer> {
    let tId: string;
    let tUId: string;
    let oId: string;
    let s3Client: S3Client;

    try {
        tId = TransferId.parse(transferId);
    } catch (e: any) {
        if (e instanceof zod.ZodError) {
            throw new InvalidRequestError(
                "`transferId` must contain 6 case sensitive alphanumeric characters.",
                400
            );
        } else {
            throw new APIError("Unknown error.", 500);
        }
    }

    let doc: TransferSchema | null;

    try {
        tUId = getTransferUId(transferId, universalSalt);

        doc = await collections.transfers.findOne(
            { transferUId: tUId },
            { projection: { _id: 0 } }
        );
    } catch (e: any) {
        throw new InfrastructureError(
            "Failed to retreive transfer from server.",
            500
        );
    }

    if (!doc)
        throw new NonExistentTransferError(
            "No transfer associated with the provided `transferId` exists.",
            404
        );

    const expiresIn = doc.timestamp + doc.expireIn - Date.now();

    const expired = expiresIn <= 0;
    const maxViewsReached: boolean = doc.views >= doc.maxViews;
    const maxDownloadsReached: boolean = doc.downloads >= doc.maxDownloads;

    if (expired || maxViewsReached || maxDownloadsReached) {
        try {
            await collections.transfers.updateOne(
                { transferUId: tUId },
                { $set: { status: TransferStatus.expired } }
            );
            doc.status = TransferStatus.expired;
        } catch (e: any) {
            throw new InfrastructureError(
                "Transfer expired. Error deleting from server.",
                500
            );
        }

        try {
            oId = getObjectId(tId, tUId, doc.objectIdSalt);

            s3Client = new S3Client({ region: whizfileConfig.s3.region });
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

            throw new InfrastructureError(
                "Error deleting object from media server.",
                500
            );
        }
    }

    if (doc.status !== "active") {
        throw new InactiveTransferError(
            "Transfer with associated `transferId` is not active.",
            410
        );
    }

    return { ...doc, expiresIn: expiresIn };
}

export {
    handleResponse,
    getTransferUId,
    getObjectId,
    generateTransferId,
    generateRandomSalt,
    hash,
    streamToBuffer,
    fetchTransfer,
};
