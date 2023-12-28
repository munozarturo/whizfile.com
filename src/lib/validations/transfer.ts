import { formatFileSize, formatMilliseconds } from "@/lib/utils";

import whizfileConfig from "@/lib/config/config";
import { z } from "zod";

const {
    maxTitleLength,
    maxMessageLength,
    maxDownloadsMin,
    maxDownloadsMax,
    maxViewsMin,
    maxViewsMax,
    expireInMax,
    maxSize,
} = whizfileConfig.api.transfer;

function preprocessStringToNumber(
    input: unknown
): Number | undefined | unknown {
    if (typeof input === "string") {
        const parsed = parseInt(input, 10);
        return isNaN(parsed) ? undefined : parsed;
    }
    return input;
}

function dateTimeGT(date: string, time: string, lower: Date): boolean {
    const dateTime = new Date(`${date}T${time}`);

    return dateTime > lower;
}

function dateTimeLT(date: string, time: string, upper: Date): boolean {
    const dateTime = new Date(`${date}T${time}`);

    return dateTime < upper;
}

const TransferFormSchema = z
    .object({
        title: z.string().max(maxTitleLength, {
            message: `title must be less than ${maxTitleLength} characters in length.`,
        }),
        message: z.string().max(maxMessageLength, {
            message: `message must be less than ${maxMessageLength} characters in length.`,
        }),
        expiryDate: z
            .string()
            .refine((dateString) => /^\d{4}-\d{2}-\d{2}$/.test(dateString), {
                message: "invalid date format. use YYYY-MM-DD.",
            }),
        expiryTime: z.string().refine(
            (timeString) => {
                const timeRegex = /^\d{2}:\d{2}$/; // Basic HH:MM format check
                return timeRegex.test(timeString);
            },
            { message: "invalid time format. use HH:MM." }
        ),
        maxViews: z.preprocess(
            preprocessStringToNumber,
            z
                .number()
                .min(
                    maxViewsMin,
                    `maximum views must be greater than ${maxViewsMin}`
                )
                .max(
                    maxViewsMax,
                    `maximum views must be less than ${maxViewsMax}`
                )
        ),
        maxDownloads: z.preprocess(
            preprocessStringToNumber,
            z
                .number()
                .min(
                    maxDownloadsMin,
                    `maximum downloads must be greater than ${maxDownloadsMin}`
                )
                .max(
                    maxDownloadsMax,
                    `maximum downloads must be less than ${maxDownloadsMax}`
                )
        ),
        allowDelete: z.boolean(),
        // files: z
        //     .array(
        //         z.custom((data) => data instanceof File, {
        //             message: "each item must be a file.",
        //         })
        //     )
        //     .min(1, "select at least one file for the transfer.")
        //     .refine(
        //         (files) => {
        //             const totalSize = files.reduce((acc: number, file) => {
        //                 if (file instanceof File) {
        //                     return acc + file.size;
        //                 }
        //                 return acc;
        //             }, 0);
        //             return totalSize <= maxSize;
        //         },
        //         {
        //             message: `total file size must be less than ${formatFileSize(
        //                 maxSize
        //             )}`,
        //         }
        //     ),
    })
    .superRefine((fields, context) => {
        const combinedDateTime = new Date(
            `${fields.expiryDate}T${fields.expiryTime}`
        );
        const now = new Date();
        const maxDateTime = new Date(now.getTime() + expireInMax);

        if (combinedDateTime < now) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["expiryDate"],
                message: "Expiry date and time must be in the future.",
            });
        }

        if (combinedDateTime > maxDateTime) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["expiryDate"],
                message: `Expiry date and time must be within ${formatMilliseconds(
                    expireInMax
                )} from now.`,
            });
        }
    });

export { TransferFormSchema };
