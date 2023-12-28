import * as zod from "zod";

import { Hash } from "./shared";
import whizfileConfig from "@/lib/config/config";

const TransferId = zod
    .string()
    .refine((input) => /^[a-zA-Z0-9]{6}$/.test(input));

const ObjectData = zod.object({
    size: zod.preprocess((input) => {
        if (typeof input === "string") {
            const parsed = Number(input);
            return isNaN(parsed) ? undefined : parsed;
        }
        return input;
    }, zod.number()),
    fileHash: Hash,
});

const TransfersReq = zod.object({
    title: zod.string().max(whizfileConfig.api.transfer.maxTitleLength),
    message: zod.string().max(whizfileConfig.api.transfer.maxMessageLength),
    objectData: ObjectData,
    allowDelete: zod.boolean().optional().default(false),
    expireIn: zod
        .number()
        .min(whizfileConfig.api.transfer.expireInMin)
        .max(whizfileConfig.api.transfer.expireInMax)
        .optional()
        .default(whizfileConfig.api.transfer.expireInMax),
    maxViews: zod
        .number()
        .min(whizfileConfig.api.transfer.maxViewsMin)
        .max(whizfileConfig.api.transfer.maxViewsMax)
        .optional()
        .default(whizfileConfig.api.transfer.maxViewsMax),
    maxDownloads: zod
        .number()
        .min(whizfileConfig.api.transfer.maxDownloadsMin)
        .max(whizfileConfig.api.transfer.maxDownloadsMax)
        .optional()
        .default(whizfileConfig.api.transfer.maxDownloadsMax),
});

export { TransfersReq, TransferId };
