import * as zod from "zod";

import { Hash } from "./shared";
import whizfileConfig from "@/lib/config/config";

const TransferId = zod
    .string()
    .refine((input) => /^[a-zA-Z0-9]{6}$/.test(input), {
        message: "Invalid transfer ID format",
    });

const ObjectData = zod.object({
    size: zod
        .number()
        .nonnegative({ message: "Size must be a non-negative number" }),
    fileHash: Hash,
});

const TransfersReq = zod.object({
    title: zod
        .string()
        .max(
            whizfileConfig.api.transfer.maxTitleLength,
            `Title must be at most ${whizfileConfig.api.transfer.maxTitleLength} characters long`
        ),
    message: zod
        .string()
        .max(
            whizfileConfig.api.transfer.maxMessageLength,
            `Message must be at most ${whizfileConfig.api.transfer.maxMessageLength} characters long`
        ),
    objectData: ObjectData,
    allowDelete: zod.boolean().optional().default(false),
    expireIn: zod
        .number()
        .min(whizfileConfig.api.transfer.expireInMin, "Expire time is too soon")
        .max(whizfileConfig.api.transfer.expireInMax, "Expire time is too late")
        .optional()
        .default(whizfileConfig.api.transfer.expireInMax),
    maxViews: zod
        .number()
        .min(whizfileConfig.api.transfer.maxViewsMin, "Maximum views too low")
        .max(whizfileConfig.api.transfer.maxViewsMax, "Maximum views too high")
        .optional()
        .default(whizfileConfig.api.transfer.maxViewsMax),
    maxDownloads: zod
        .number()
        .min(
            whizfileConfig.api.transfer.maxDownloadsMin,
            "Maximum downloads too low"
        )
        .max(
            whizfileConfig.api.transfer.maxDownloadsMax,
            "Maximum downloads too high"
        )
        .optional()
        .default(whizfileConfig.api.transfer.maxDownloadsMax),
});

export { TransfersReq, TransferId };
