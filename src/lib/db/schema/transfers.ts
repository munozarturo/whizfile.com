import * as zod from "zod";
import { Hash } from "./shared";

const TransferStatus = zod.enum(["active", "expired", "deleted", "removed"]);

const ObjectData = zod.object({
    size: zod.number(),
    fileHash: Hash,
});

const TransferSchema = zod.object({
    transferUId: Hash,
    timestamp: zod.number(),
    status: TransferStatus,
    uploadUrl: zod.string(),

    title: zod.string(),
    message: zod.string(),
    objectData: ObjectData,

    objectIdSalt: zod.string(),
});

export { TransferSchema };
