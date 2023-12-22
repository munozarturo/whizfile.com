import * as zod from "zod";
import { Hash } from "./shared";

const TransferStatus = zod.enum([
    "active", // for transfers that are active
    "failed", // for when the generation of a presigned S3 URL fails
    "expired", // for transfers that have expired
    "deleted", // for transfers that have been deleted by a user
    "removed", // for transfers which were force removed by an administrator
    "corrupted", // for when the file hash does not match the hash of the updated file
]);

const ObjectData = zod.object({
    size: zod.number(),
    fileHash: Hash,
});

const TransferSchema = zod.object({
    transferUId: Hash,
    timestamp: zod.number(),
    status: TransferStatus,

    title: zod.string(),
    message: zod.string(),
    objectData: ObjectData,
    allowDelete: zod.boolean(),
    expireIn: zod.number(),

    views: zod.number(),
    downloads: zod.number(),

    objectIdSalt: zod.string(),
});

const TransferIdSchema = zod.object({
    transferIdHash: Hash,
});

export { TransferSchema, TransferIdSchema };
