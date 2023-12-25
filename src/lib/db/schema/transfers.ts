import { Hash } from "./shared";

enum TransferStatus {
    active = "active", // for transfers that are active
    failed = "failed", // for when the generation of a presigned S3 URL fails
    expired = "expired", // for transfers that have expired
    deleted = "deleted", // for transfers that have been deleted by a user
    removed = "removed", // for transfers which were force removed by an administrator
    corrupted = "corrupted", // for when the file hash does not match the hash of the updated file
}

type ObjectData = {
    size: number;
    fileHash: Hash;
};

type TransferSchema = {
    transferUId: Hash;
    timestamp: number;
    status: TransferStatus;

    title: string;
    message: string;
    objectData: ObjectData;
    allowDelete: boolean;
    expireIn: number;

    views: number;
    downloads: number;

    maxViews: number;
    maxDownloads: number;

    objectIdSalt: string;
};

type ProcessedTransfer = {
    transferUId: Hash;
    timestamp: number;
    status: TransferStatus;

    title: string;
    message: string;
    objectData: ObjectData;
    allowDelete: boolean;
    expireIn: number;
    expiresIn: number;

    views: number;
    downloads: number;

    maxViews: number;
    maxDownloads: number;

    objectIdSalt: string;
};

export { TransferStatus, type TransferSchema, type ProcessedTransfer };
