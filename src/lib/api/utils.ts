import * as zod from "zod";
import { createHash, randomBytes } from "crypto";

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

function handleError(e: any): ApiResponse {
    var errorMessage;

    if (e instanceof zod.ZodError) {
        console.log(e.message);
        errorMessage = "Invalid contents.";
    } else if (e instanceof Error) {
        console.error(e);
        errorMessage = e.name;
    } else {
        console.log("Unknown error.");
        errorMessage = "Unknown error.";
    }

    return handleResponse(errorMessage);
}

function getTransferUId(transferId: string, salt: string): string {
    const hash = createHash("sha256");
    hash.update(transferId);
    hash.update(salt);
    return hash.digest("hex");
}

function getObjectId(transferUId: string, salt: string): string {
    const hash = createHash("sha256");
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

export {
    handleResponse,
    handleError,
    getTransferUId,
    getObjectId,
    generateTransferId,
    generateRandomSalt,
};
